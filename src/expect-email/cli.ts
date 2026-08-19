import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseCsv } from "./csv";
import { filterApprovedGuests, guestsFromCsvRecords } from "./map-guest";
import { renderExpectEmailHtml } from "./render";
import { createResendSendDeps, sendExpectEmail, type SendExpectEmailDeps } from "./send";
import type { ExpectEmailGuest } from "./types";

export interface ExpectEmailCliOptions {
  csvPath: string;
  outDir: string;
  dryRun: boolean;
  send: boolean;
  limit?: number;
  /** Injected for tests; when omitted and --send, uses Resend. */
  sendDeps?: SendExpectEmailDeps;
  log?: (message: string) => void;
}

export interface ExpectEmailCliResult {
  guests: ExpectEmailGuest[];
  written: string[];
  sent: string[];
  dryRunListed: string[];
}

function parseArgs(argv: string[]): {
  csvPath: string | undefined;
  dryRun: boolean;
  send: boolean;
  limit?: number;
  outDir: string;
} {
  let csvPath: string | undefined;
  let dryRun = false;
  let send = false;
  let limit: number | undefined;
  let outDir = join(process.cwd(), "out", "expect-email");

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--send") {
      send = true;
      continue;
    }
    if (arg === "--limit") {
      const value = argv[++i];
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid --limit value: ${value}`);
      }
      limit = Math.floor(parsed);
      continue;
    }
    if (arg === "--out") {
      const value = argv[++i];
      if (!value) throw new Error("Missing value for --out");
      outDir = value;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    csvPath = arg;
  }

  return { csvPath, dryRun, send, limit, outDir };
}

export async function runExpectEmailCli(
  options: ExpectEmailCliOptions,
): Promise<ExpectEmailCliResult> {
  const log = options.log ?? console.log;
  const csvText = await Bun.file(options.csvPath).text();
  const records = parseCsv(csvText);
  let guests = filterApprovedGuests(guestsFromCsvRecords(records));

  if (options.limit !== undefined) {
    guests = guests.slice(0, options.limit);
  }

  await mkdir(options.outDir, { recursive: true });

  const written: string[] = [];
  const sent: string[] = [];
  const dryRunListed: string[] = [];

  for (const guest of guests) {
    const fileKey = guest.guestId || guest.email.replace(/[^a-zA-Z0-9._-]+/g, "_") || "guest";
    const outPath = join(options.outDir, `${fileKey}.html`);
    const html = await renderExpectEmailHtml(guest, { preview: true });
    await Bun.write(outPath, html);
    written.push(outPath);

    if (options.dryRun) {
      dryRunListed.push(guest.email);
      log(`[dry-run] would email ${guest.email} (${guest.name || guest.firstName}, ${guest.ticketName})`);
    }
  }

  if (options.send) {
    if (options.dryRun) {
      log("Refusing to send: --dry-run and --send cannot both send. Dry-run only listed recipients.");
    } else {
      const deps = options.sendDeps ?? createResendSendDeps();
      for (const guest of guests) {
        await sendExpectEmail(guest, deps);
        sent.push(guest.email);
        log(`Sent to ${guest.email}`);
      }
    }
  } else if (!options.dryRun) {
    log(`Wrote ${written.length} preview(s) to ${options.outDir}`);
    log("No email sent. Pass --dry-run to list recipients, or --send with Resend env vars to send.");
  }

  return { guests, written, sent, dryRunListed };
}

async function main(): Promise<void> {
  const { csvPath, dryRun, send, limit, outDir } = parseArgs(process.argv.slice(2));

  if (!csvPath) {
    console.error(
      "Usage: bun run expect-email -- <guests.csv> [--dry-run] [--send] [--limit N] [--out dir]",
    );
    process.exit(1);
  }

  const exists = await Bun.file(csvPath).exists();
  if (!exists) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  await runExpectEmailCli({
    csvPath,
    outDir,
    dryRun,
    send,
    limit,
  });
}

if (import.meta.main) {
  await main();
}
