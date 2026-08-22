#!/usr/bin/env bun
/**
 * Rebuild data/passports-by-email.json from the live UUID-keyed passports.json.
 *
 * Usage:
 *   bun run sync-passports
 *
 * Does not commit. Review the output before deploying — it contains guest emails.
 */
import { join } from "node:path";
import { PASSPORTS_JSON_URL } from "../src/shared-credits";

type LivePassport = {
  firstName?: string;
  lastName?: string;
  passportId?: string;
  passportUrl?: string;
  email?: string;
  cursorReferralUrl?: string;
  cursorCode?: string;
};

type PassportGuest = {
  firstName: string;
  lastName: string;
  passportId: string;
  passportUrl: string;
  cursorReferralUrl?: string;
  cursorCode?: string;
};

const root = join(import.meta.dir, "..");
const outPath = join(root, "data/passports-by-email.json");

const response = await fetch(PASSPORTS_JSON_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch ${PASSPORTS_JSON_URL}: ${response.status}`);
}

const live = (await response.json()) as Record<string, LivePassport>;
const byEmail: Record<string, PassportGuest> = {};
let skipped = 0;

for (const [id, entry] of Object.entries(live)) {
  const email = entry.email?.trim().toLowerCase();
  if (!email) {
    skipped += 1;
    continue;
  }

  const passportId = entry.passportId?.trim() || id;
  const passportUrl =
    entry.passportUrl?.trim() || `https://passport.cursorvictoria.com/${passportId}`;

  byEmail[email] = {
    firstName: entry.firstName?.trim() || "",
    lastName: entry.lastName?.trim() || "",
    passportId,
    passportUrl,
    ...(entry.cursorReferralUrl?.trim()
      ? { cursorReferralUrl: entry.cursorReferralUrl.trim() }
      : {}),
    ...(entry.cursorCode?.trim() ? { cursorCode: entry.cursorCode.trim() } : {}),
  };
}

await Bun.write(outPath, `${JSON.stringify(byEmail, null, 2)}\n`);

console.log(
  `Wrote ${Object.keys(byEmail).length} guests to data/passports-by-email.json (${skipped} without email skipped).`,
);
console.log("Review before commit/deploy — this file may contain real guest PII.");
