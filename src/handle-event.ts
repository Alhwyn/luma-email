import type { UnwrappedWebhookEvent } from "@alhwyn/luma";
import { sendEmail } from "./email";
import { renderCursorCreditsEmailHtml } from "./email-template";
import { env } from "./env";

function guestName(
  event: Extract<UnwrappedWebhookEvent, { type: "guest.updated" }>,
): string {
  return (
    event.data.user_name ??
    ([event.data.user_first_name, event.data.user_last_name].filter(Boolean).join(" ") ||
      "there")
  );
}

export async function handleLumaEvent(event: UnwrappedWebhookEvent): Promise<void> {
  if (event.type !== "guest.updated") {
    return;
  }

  if (event.data.event.id !== env.lumaEventId()) {
    return;
  }

  const checkedIn = event.data.event_tickets.some((ticket) => ticket.checked_in_at !== null);
  if (!checkedIn) {
    return;
  }

  const name = guestName(event);
  await sendEmail({
    to: event.data.user_email,
    subject: "Thanks for joining Cursor Victoria Meetup — here are your Cursor credits",
    html: await renderCursorCreditsEmailHtml({ name }),
  });
}
