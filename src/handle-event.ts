import type { UnwrappedWebhookEvent } from "@alhwyn/luma";
import { sendEmail } from "./email";
import { renderCursorCreditsEmailHtml } from "./email-template";
import { env } from "./env";

type GuestUpdatedEvent = Extract<UnwrappedWebhookEvent, { type: "guest.updated" }>;

async function handleGuestUpdated(event: GuestUpdatedEvent): Promise<void> {
  if (event.data.event.id !== env.lumaEventId()) {
    return;
  }

  const checkedIn = event.data.event_tickets.some((ticket) => ticket.checked_in_at !== null);
  if (!checkedIn) {
    return;
  }

  const eventName = event.data.event.name;

  await sendEmail({
    to: event.data.user_email,
    subject: `Thanks for joining ${eventName} — here are your Cursor credits`,
    html: await renderCursorCreditsEmailHtml({ eventName }),
  });
}

export async function handleLumaEvent(event: UnwrappedWebhookEvent): Promise<void> {
  switch (event.type) {
    case "guest.updated":
      await handleGuestUpdated(event);
      return;
    case "calendar.event.added":
    case "calendar.person.subscribed":
    case "event.canceled":
    case "event.created":
    case "event.updated":
    case "guest.registered":
    case "ticket.registered":
      return;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
