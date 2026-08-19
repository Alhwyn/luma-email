import type { ExpectEmailGuest, LumaGuestRow } from "./types";

const CITY_KEYS = [
  "Where are you based?",
  "where are you based?",
  "city",
  "City",
] as const;

const TRAVEL_KEYS = [
  "Are you traveling to Victoria, BC Canada for this?",
  "Are you traveling to Victoria, BC Canada for this",
  "traveling_to_victoria",
  "Traveling to Victoria",
] as const;

const COMPANY_KEYS = ["company", "Company", "organization", "Organization"] as const;

const AVATAR_KEYS = [
  "x_avatar_path",
  "linkedin_avatar_path",
  "avatar_url",
  "avatar",
  "Avatar URL",
] as const;

function pick(raw: Record<string, string>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = raw[key]?.trim();
    if (value) return value;
  }
  return "";
}

function pickByHeaderMatch(
  raw: Record<string, string>,
  matcher: (header: string) => boolean,
): string {
  for (const [key, value] of Object.entries(raw)) {
    if (matcher(key) && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function parseTravelAnswer(value: string): boolean | string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^(yes|y|true|1)$/i.test(trimmed)) return true;
  if (/^(no|n|false|0)$/i.test(trimmed)) return false;
  return trimmed;
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Map a Luma-style guest CSV row into a normalized guest for the expect email.
 * Avatar paths that are not http(s) URLs are ignored (local dumps are not embedded).
 */
export function mapLumaGuestRow(raw: Record<string, string>): LumaGuestRow {
  const avatarCandidate = pick(raw, AVATAR_KEYS);
  const city =
    pick(raw, CITY_KEYS) ||
    pickByHeaderMatch(raw, (header) => /where are you based/i.test(header));
  const traveling =
    pick(raw, TRAVEL_KEYS) ||
    pickByHeaderMatch(raw, (header) => /traveling to victoria/i.test(header));

  return {
    guest_id: (raw.guest_id ?? raw.api_id ?? raw.id ?? "").trim(),
    name: (raw.name ?? "").trim(),
    first_name: (raw.first_name ?? "").trim(),
    email: (raw.email ?? "").trim(),
    approval_status: (raw.approval_status ?? "").trim(),
    ticket_name: (raw.ticket_name ?? raw.ticket ?? "").trim(),
    city,
    company: pick(raw, COMPANY_KEYS),
    traveling_to_victoria: traveling,
    avatar_url: looksLikeUrl(avatarCandidate) ? avatarCandidate.trim() : "",
    raw,
  };
}

export function toExpectEmailGuest(row: LumaGuestRow): ExpectEmailGuest {
  const firstName =
    row.first_name ||
    row.name.split(/\s+/)[0] ||
    "";

  return {
    guestId: row.guest_id,
    email: row.email,
    firstName,
    name: row.name || firstName,
    ticketName: row.ticket_name || "Guest",
    city: row.city || undefined,
    company: row.company || undefined,
    travelingToVictoria: parseTravelAnswer(row.traveling_to_victoria),
    avatarUrl: row.avatar_url || undefined,
    approvalStatus: row.approval_status,
  };
}

export function isApprovedGuest(guest: ExpectEmailGuest): boolean {
  return guest.approvalStatus.trim().toLowerCase() === "approved";
}

export function filterApprovedGuests(guests: ExpectEmailGuest[]): ExpectEmailGuest[] {
  return guests.filter(isApprovedGuest);
}

export function guestsFromCsvRecords(records: Record<string, string>[]): ExpectEmailGuest[] {
  return records.map((record) => toExpectEmailGuest(mapLumaGuestRow(record)));
}
