/**
 * Normalize guest-provided X and LinkedIn profile values from Luma survey fields.
 */

export function parseXHandle(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Full URL: https://x.com/name, https://twitter.com/name, with optional @ and query/path
  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]{1,15})(?:[/?#]|$)/i,
  );
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  // @handle or bare handle
  const handleMatch = trimmed.match(/^@?([A-Za-z0-9_]{1,15})$/);
  if (handleMatch?.[1]) {
    return handleMatch[1];
  }

  return null;
}

export type LinkedInProfile = {
  /** Canonical profile URL when resolvable. */
  url: string;
  /** Username / vanity slug for unavatar (`user:slug` or path slug). */
  username: string;
  kind: "user" | "company";
};

export function parseLinkedInProfile(raw: string | undefined | null): LinkedInProfile | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^(?:www\.)?linkedin\.com\//i.test(candidate)) {
      candidate = `https://${candidate.replace(/^\/\//, "")}`;
    } else if (/^in\//i.test(candidate) || /^company\//i.test(candidate)) {
      candidate = `https://www.linkedin.com/${candidate}`;
    } else if (/^[A-Za-z0-9_-]+$/.test(candidate)) {
      // Bare vanity name — assume personal profile
      return {
        url: `https://www.linkedin.com/in/${candidate}`,
        username: candidate,
        kind: "user",
      };
    } else {
      return null;
    }
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (!/(?:^|\.)linkedin\.com$/i.test(url.hostname)) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const kindPart = parts[0]?.toLowerCase();
  const slug = parts[1];

  if (!slug) return null;

  if (kindPart === "in" || kindPart === "pub") {
    return {
      url: `https://www.linkedin.com/in/${slug}`,
      username: slug,
      kind: "user",
    };
  }

  if (kindPart === "company") {
    return {
      url: `https://www.linkedin.com/company/${slug}`,
      username: slug,
      kind: "company",
    };
  }

  return null;
}

export function buildXSearchQuery(params: {
  name: string;
  company?: string;
  location?: string;
}): string {
  const bits = [`"${params.name.trim()}"`];
  if (params.company?.trim()) bits.push(params.company.trim());
  if (params.location?.trim()) bits.push(params.location.trim());
  bits.push("site:x.com");
  return bits.join(" ");
}

export function buildLinkedInSearchQuery(params: {
  name: string;
  company?: string;
  location?: string;
}): string {
  const bits = [`"${params.name.trim()}"`];
  if (params.company?.trim()) bits.push(params.company.trim());
  if (params.location?.trim()) bits.push(params.location.trim());
  bits.push("site:linkedin.com/in");
  return bits.join(" ");
}
