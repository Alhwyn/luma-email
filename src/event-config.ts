/**
 * Editable placeholders for Cursor Codechella @ Victoria.
 * Fill in venue/date/lumaUrl when confirmed. Do not invent real details here.
 */
export const victoriaEventConfig = {
  eventName: "Cursor Codechella @ Victoria",
  city: "Victoria, BC",
  /** e.g. "Saturday, [date] · doors at [time]" — leave blank until confirmed */
  date: "",
  /** Venue name / address — leave blank until confirmed */
  venue: "",
  /** Public Luma event URL — leave blank until confirmed */
  lumaUrl: "",
} as const;

export type VictoriaEventConfig = typeof victoriaEventConfig;
