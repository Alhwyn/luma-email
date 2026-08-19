/** Ticket-type one-liners for the Victoria expect email. */

export type TicketKind = "standard" | "watch_demos" | "other";

export function classifyTicket(ticketName: string): TicketKind {
  const normalized = ticketName.trim().toLowerCase();
  if (!normalized) {
    return "other";
  }
  if (normalized.includes("watch") && normalized.includes("demo")) {
    return "watch_demos";
  }
  if (normalized === "standard" || normalized.includes("builder") || normalized.includes("hack")) {
    return "standard";
  }
  return "other";
}

export function ticketOneLiner(ticketName: string): string {
  const kind = classifyTicket(ticketName);
  switch (kind) {
    case "standard":
      return "Your ticket is Standard: you are here to build. Pick a project, ship something small, and share it at demos.";
    case "watch_demos":
      return "Your ticket is Watch the Demos: hang out, meet builders, and catch the demos. No pressure to ship.";
    case "other":
      return ticketName.trim()
        ? `Your ticket is ${ticketName.trim()}. Come ready to meet people and enjoy the day.`
        : "Come ready to meet people, build if you want, and enjoy the day.";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
