#!/usr/bin/env bun
/**
 * Enrich a Luma guests CSV with X / LinkedIn profile photo URLs and local PNG caches.
 *
 * Usage:
 *   bun run enrich-avatars -- data/guests.csv
 *   bun run enrich-avatars -- fixtures/guests.sample.csv --limit 2 --dry-run
 *
 * Avatars are resolved via the public unavatar.io API (optional UNAVATAR_API_KEY).
 * Name-based search is best-effort: we record the query and mark not_found when
 * no handle/URL was provided (we do not scrape or log into X/LinkedIn).
 */

import { dirname, resolve } from "node:path";
import { parseCsv, stringifyCsv } from "../src/enrich/csv";
import { emptyEnrichment, enrichGuest, mergeEnrichment, mergeHeaders } from "../src/enrich/enrich";
import { LUMA_COLUMNS } from "../src/enrich/types";

type CliOptions = {
  input: string;
  out: string;
  avatarsDir: string;
  limit: number | null;
  delayMs: number;
  dryRun: boolean;
};

function printHelp(): void {
  console.log(`Enrich Luma guests CSV with X / LinkedIn avatars

Usage:
  bun run enrich-avatars -- <input.csv> [options]

Options:
  --out <path>         Output CSV (default: <input>.enriched.csv)
  --avatars-dir <dir>  Where to write PNGs (default: avatars/)
  --limit <n>          Only process the first N guests
  --delay <ms>         Delay between avatar fetches (default: 500)
  --dry-run            Parse handles / plan paths without fetching
  -h, --help           Show this help
`);
}

function parseArgs(argv: string[]): CliOptions | "help" {
  const args = argv.slice(2).filter((a) => a !== "--");
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    return "help";
  }

  let input: string | undefined;
  let out: string | undefined;
  let avatarsDir = "avatars";
  let limit: number | null = null;
  let delayMs = 500;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--out") {
      out = args[++i];
      continue;
    }
    if (arg === "--avatars-dir") {
      avatarsDir = args[++i] ?? avatarsDir;
      continue;
    }
    if (arg === "--limit") {
      const raw = args[++i];
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`Invalid --limit: ${raw}`);
      }
      limit = Math.floor(n);
      continue;
    }
    if (arg === "--delay") {
      const raw = args[++i];
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        throw new Error(`Invalid --delay: ${raw}`);
      }
      delayMs = Math.floor(n);
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    if (input) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    input = arg;
  }

  if (!input) {
    throw new Error("Missing input CSV path");
  }

  const inputPath = resolve(input);
  const outPath = resolve(out ?? inputPath.replace(/\.csv$/i, "") + ".enriched.csv");

  return {
    input: inputPath,
    out: outPath,
    avatarsDir: resolve(avatarsDir),
    limit,
    delayMs,
    dryRun,
  };
}

async function main(): Promise<void> {
  let options: CliOptions | "help";
  try {
    options = parseArgs(process.argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    printHelp();
    process.exit(1);
  }

  if (options === "help") {
    printHelp();
    process.exit(0);
  }

  const file = Bun.file(options.input);
  if (!(await file.exists())) {
    console.error(`Input not found: ${options.input}`);
    process.exit(1);
  }

  const { headers, rows } = parseCsv(await file.text());
  if (!headers.includes(LUMA_COLUMNS.guestId)) {
    console.error(`CSV missing required column: ${LUMA_COLUMNS.guestId}`);
    process.exit(1);
  }

  const slice = options.limit != null ? rows.slice(0, options.limit) : rows;
  console.log(
    `Enriching ${slice.length}/${rows.length} guests from ${options.input}` +
      (options.dryRun ? " (dry-run)" : ""),
  );

  if (!options.dryRun) {
    await Bun.$`mkdir -p ${options.avatarsDir}`.quiet();
  }

  const enrichedRows = [];
  let ok = 0;
  let partial = 0;
  let notFound = 0;
  let skipped = 0;

  for (let i = 0; i < slice.length; i++) {
    const row = slice[i]!;
    const guestId = row[LUMA_COLUMNS.guestId] ?? String(i);
    try {
      const enrichment = await enrichGuest(row, {
        avatarsDir: options.avatarsDir,
        delayMs: options.delayMs,
        dryRun: options.dryRun,
      });
      enrichedRows.push(mergeEnrichment(row, enrichment));

      switch (enrichment.avatar_status) {
        case "ok":
          ok++;
          break;
        case "partial":
          partial++;
          break;
        case "not_found":
          notFound++;
          break;
        case "skipped":
          skipped++;
          break;
        default: {
          const _exhaustive: never = enrichment.avatar_status;
          void _exhaustive;
        }
      }

      console.log(
        `[${i + 1}/${slice.length}] ${guestId} → ${enrichment.avatar_status}` +
          (enrichment.x_handle ? ` x=@${enrichment.x_handle}` : "") +
          (enrichment.linkedin_url ? ` li=${enrichment.linkedin_url}` : ""),
      );
    } catch (error) {
      console.warn(
        `[${i + 1}/${slice.length}] ${guestId} failed:`,
        error instanceof Error ? error.message : error,
      );
      const enrichment = emptyEnrichment();
      enrichment.avatar_status = "not_found";
      enrichedRows.push(mergeEnrichment(row, enrichment));
      notFound++;
    }
  }

  // Keep remaining rows (beyond --limit) unchanged except empty enrichment cols
  if (options.limit != null && rows.length > options.limit) {
    for (const row of rows.slice(options.limit)) {
      enrichedRows.push(row);
    }
  }

  const outHeaders = mergeHeaders(headers);
  await Bun.$`mkdir -p ${dirname(options.out)}`.quiet();
  await Bun.write(options.out, stringifyCsv(outHeaders, enrichedRows));

  console.log(`\nWrote ${options.out}`);
  console.log(`Summary: ok=${ok} partial=${partial} not_found=${notFound} skipped=${skipped}`);
  if (!options.dryRun) {
    console.log(`Avatars dir: ${options.avatarsDir}`);
  }
  if (!process.env.UNAVATAR_API_KEY) {
    console.log("Tip: set UNAVATAR_API_KEY in .env for higher unavatar rate limits.");
  }
}

await main();
