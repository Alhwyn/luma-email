import type { UnwrappedWebhookEvent } from "@alhwyn/luma";
import { sendEmail } from "./email";
import { renderCodechellaPassportEmailHtml } from "./email-template";
import { env } from "./env";
import { lookupPassportByEmail } from "./passports";
import { FALLBACK_PASSPORT_URL } from "./shared-credits";

type GuestUpdatedEvent = Extract<UnwrappedWebhookEvent, { type: "guest.updated" }>;

function firstNameFromLuma(event: GuestUpdatedEvent): string {
  const fromPayload = event.data.user_first_name?.trim();
  if (fromPayload) {
    return fromPayload;
  }

  const fullName = event.data.user_name?.trim();
  if (fullName) {
    return fullName.split(/\s+/)[0] ?? fullName;
  }

  return "there";
}

async function handleGuestUpdated(event: GuestUpdatedEvent): Promise<void> {
  if (event.data.event.id !== env.lumaEventId()) {
    return;
  }

  const checkedIn = event.data.event_tickets.some((ticket) => ticket.checked_in_at !== null);
  if (!checkedIn) {
    return;
  }

  const email = event.data.user_email;
  const passport = lookupPassportByEmail(email);
  const firstName = passport?.firstName?.trim() || firstNameFromLuma(event);
  const passportUrl = passport?.passportUrl || FALLBACK_PASSPORT_URL;

  await sendEmail({
    to: email,
    subject: "Your Codechella passport",
    html: await renderCodechellaPassportEmailHtml({
      firstName,
      passportUrl,
      cursorReferralUrl: passport?.cursorReferralUrl,
      cursorCode: passport?.cursorCode,
    }),
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
