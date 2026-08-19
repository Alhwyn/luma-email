export type AvatarStatus = "ok" | "partial" | "not_found" | "skipped";

export type AvatarSource = "x" | "linkedin" | "none";

export type GuestRow = Record<string, string>;

export type EnrichmentFields = {
  x_handle: string;
  x_avatar_url: string;
  x_avatar_path: string;
  x_search_query: string;
  linkedin_url: string;
  linkedin_avatar_url: string;
  linkedin_avatar_path: string;
  linkedin_search_query: string;
  avatar_source: AvatarSource;
  avatar_status: AvatarStatus;
};

export const ENRICHMENT_COLUMNS = [
  "x_handle",
  "x_avatar_url",
  "x_avatar_path",
  "x_search_query",
  "linkedin_url",
  "linkedin_avatar_url",
  "linkedin_avatar_path",
  "linkedin_search_query",
  "avatar_source",
  "avatar_status",
] as const satisfies ReadonlyArray<keyof EnrichmentFields>;

/** Luma survey / export column names we care about. */
export const LUMA_COLUMNS = {
  guestId: "guest_id",
  name: "name",
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  linkedin: "What is your LinkedIn profile?",
  github: "What is your GitHub username?",
  x: "What is your X (Twitter) handle?",
  company: "What company do you work for?",
  location: "Where are you based?",
} as const;

export type ResolveResult = {
  handleOrUrl: string;
  avatarUrl: string;
  avatarPath: string;
  searchQuery: string;
  found: boolean;
};
