import { join } from "node:path";
import {
  buildLinkedInSearchQuery,
  buildXSearchQuery,
  parseLinkedInProfile,
  parseXHandle,
} from "./handles";
import { fetchAvatarImage, linkedInUnavatarUrl, xUnavatarUrl } from "./resolve";
import {
  ENRICHMENT_COLUMNS,
  LUMA_COLUMNS,
  type EnrichmentFields,
  type GuestRow,
} from "./types";

export type EnrichGuestOptions = {
  avatarsDir: string;
  delayMs?: number;
  fetchImpl?: typeof fetch;
  apiKey?: string;
  /** Skip network / disk writes (still parses handles). */
  dryRun?: boolean;
  baseUrl?: string;
};

function cell(row: GuestRow, key: string): string {
  return (row[key] ?? "").trim();
}

function guestDisplayName(row: GuestRow): string {
  const name = cell(row, LUMA_COLUMNS.name);
  if (name) return name;
  const first = cell(row, LUMA_COLUMNS.firstName);
  const last = cell(row, LUMA_COLUMNS.lastName);
  return [first, last].filter(Boolean).join(" ").trim();
}

export function emptyEnrichment(): EnrichmentFields {
  return {
    x_handle: "",
    x_avatar_url: "",
    x_avatar_path: "",
    x_search_query: "",
    linkedin_url: "",
    linkedin_avatar_url: "",
    linkedin_avatar_path: "",
    linkedin_search_query: "",
    avatar_source: "none",
    avatar_status: "skipped",
  };
}

export async function enrichGuest(
  row: GuestRow,
  options: EnrichGuestOptions,
): Promise<EnrichmentFields> {
  const result = emptyEnrichment();
  const guestId = cell(row, LUMA_COLUMNS.guestId) || "unknown";
  const name = guestDisplayName(row);
  const company = cell(row, LUMA_COLUMNS.company);
  const location = cell(row, LUMA_COLUMNS.location);

  const rawX = cell(row, LUMA_COLUMNS.x);
  const rawLinkedIn = cell(row, LUMA_COLUMNS.linkedin);

  const xHandle = parseXHandle(rawX);
  const linkedIn = parseLinkedInProfile(rawLinkedIn);

  if (xHandle) {
    result.x_handle = xHandle;
  } else if (name) {
    result.x_search_query = buildXSearchQuery({ name, company, location });
  }

  if (linkedIn) {
    result.linkedin_url = linkedIn.url;
  } else if (name) {
    result.linkedin_search_query = buildLinkedInSearchQuery({ name, company, location });
  }

  if (!xHandle && !linkedIn) {
    result.avatar_status = name ? "not_found" : "skipped";
    return result;
  }

  if (options.dryRun) {
    if (xHandle) {
      result.x_avatar_url = xUnavatarUrl(xHandle, options.baseUrl);
      result.x_avatar_path = join(options.avatarsDir, `${guestId}-x.png`);
    }
    if (linkedIn) {
      result.linkedin_avatar_url = linkedInUnavatarUrl(linkedIn.username, linkedIn.kind, options.baseUrl);
      result.linkedin_avatar_path = join(options.avatarsDir, `${guestId}-linkedin.png`);
    }
    result.avatar_source = xHandle ? "x" : linkedIn ? "linkedin" : "none";
    result.avatar_status = "ok";
    return result;
  }

  let xFound = false;
  let linkedInFound = false;

  if (xHandle) {
    const resolverUrl = xUnavatarUrl(xHandle, options.baseUrl);
    const fetched = await fetchAvatarImage(resolverUrl, {
      delayMs: options.delayMs,
      fetchImpl: options.fetchImpl,
      apiKey: options.apiKey,
    });
    if (fetched) {
      const path = join(options.avatarsDir, `${guestId}-x.png`);
      await Bun.write(path, fetched.bytes);
      result.x_avatar_url = fetched.resolverUrl;
      result.x_avatar_path = path;
      xFound = true;
    }
  }

  if (linkedIn) {
    const resolverUrl = linkedInUnavatarUrl(linkedIn.username, linkedIn.kind, options.baseUrl);
    const fetched = await fetchAvatarImage(resolverUrl, {
      delayMs: options.delayMs,
      fetchImpl: options.fetchImpl,
      apiKey: options.apiKey,
    });
    if (fetched) {
      const path = join(options.avatarsDir, `${guestId}-linkedin.png`);
      await Bun.write(path, fetched.bytes);
      result.linkedin_avatar_url = fetched.resolverUrl;
      result.linkedin_avatar_path = path;
      linkedInFound = true;
    }
  }

  if (xFound) {
    result.avatar_source = "x";
  } else if (linkedInFound) {
    result.avatar_source = "linkedin";
  } else {
    result.avatar_source = "none";
  }

  if (xFound && linkedInFound) {
    result.avatar_status = "ok";
  } else if (xFound || linkedInFound) {
    result.avatar_status = "partial";
  } else {
    result.avatar_status = "not_found";
  }

  return result;
}

export function mergeEnrichment(row: GuestRow, enrichment: EnrichmentFields): GuestRow {
  const merged: GuestRow = { ...row };
  for (const key of ENRICHMENT_COLUMNS) {
    merged[key] = enrichment[key];
  }
  return merged;
}

export function mergeHeaders(original: string[]): string[] {
  const headers = [...original];
  for (const col of ENRICHMENT_COLUMNS) {
    if (!headers.includes(col)) {
      headers.push(col);
    }
  }
  return headers;
}

export function preferredAvatarUrl(enrichment: EnrichmentFields): string | undefined {
  if (enrichment.avatar_source === "x" && enrichment.x_avatar_url) {
    return enrichment.x_avatar_url;
  }
  if (enrichment.avatar_source === "linkedin" && enrichment.linkedin_avatar_url) {
    return enrichment.linkedin_avatar_url;
  }
  return enrichment.x_avatar_url || enrichment.linkedin_avatar_url || undefined;
}
