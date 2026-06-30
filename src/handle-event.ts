import type { UnwrappedWebhookEvent } from "@alhwyn/luma";
import { sendEmail } from "./email";
import { renderCursorCreditsEmailHtml } from "./email-template";

function guestName(event: UnwrappedWebhookEvent): string {
  if (event.type !== "guest.registered" && event.type !== "guest.updated") {
    return "there";
  }

  return (
    event.data.user_name ??
    ([event.data.user_first_name, event.data.user_last_name].filter(Boolean).join(" ") ||
      "there")
  );
}

export async function handleLumaEvent(event: UnwrappedWebhookEvent): Promise<void> {
  switch (event.type) {
    case "guest.registered": {
      const name = guestName(event);
      await sendEmail({
        to: event.data.user_email,
        subject: "Here is your Cursor credits",
        html: await renderCursorCreditsEmailHtml({ name }),
      });
      return;
    }

    case "guest.updated": {
      const checkedIn = event.data.event_tickets.some((ticket) => ticket.checked_in_at !== null);
      if (!checkedIn) {
        return;
      }

      const name = guestName(event);
      await sendEmail({
        to: event.data.user_email,
        subject: "Here is your Cursor credits",
        html: await renderCursorCreditsEmailHtml({ name }),
      });
      return;
    }

    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
