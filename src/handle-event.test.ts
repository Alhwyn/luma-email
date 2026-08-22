import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UnwrappedWebhookEvent } from "@alhwyn/luma";

const sendEmailMock = mock(async () => {});

mock.module("./email", () => ({
  sendEmail: sendEmailMock,
}));

const { handleLumaEvent } = await import("./handle-event");

function guestUpdated(overrides: {
  eventId: string;
  email: string;
  firstName?: string | null;
  checkedIn?: boolean;
}): UnwrappedWebhookEvent {
  return {
    type: "guest.updated",
    data: {
      id: "guest_1",
      user_id: "user_1",
      user_email: overrides.email,
      user_name: null,
      user_first_name: overrides.firstName ?? null,
      user_last_name: null,
      approval_status: "approved",
      check_in_qr_code: "qr",
      eth_address: null,
      invited_at: null,
      joined_at: null,
      phone_number: null,
      registered_at: "2026-08-01T00:00:00.000Z",
      registration_answers: null,
      solana_address: null,
      utm_source: null,
      custom_source: null,
      event_ticket_orders: [],
      event_tickets: [
        {
          id: "ticket_1",
          amount: 0,
          amount_discount: 0,
          amount_tax: 0,
          currency: null,
          checked_in_at: overrides.checkedIn === false ? null : "2026-08-22T15:00:00.000Z",
          event_ticket_type_id: "type_1",
          is_captured: true,
          name: "Standard",
          api_id: "ticket_1",
        },
      ],
      event: {
        id: overrides.eventId,
        name: "Codechella",
      },
    },
  } as UnwrappedWebhookEvent;
}

describe("handleLumaEvent passport check-in", () => {
  beforeEach(() => {
    sendEmailMock.mockClear();
    process.env.LUMA_EVENT_ID = "evt_codechella";
  });

  test("sends passport email with unique link when email matches data", async () => {
    await handleLumaEvent(
      guestUpdated({
        eventId: "evt_codechella",
        email: "alex.demo@example.com",
        firstName: "Ignored",
      }),
    );

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const args = sendEmailMock.mock.calls[0]![0] as {
      to: string;
      subject: string;
      html: string;
    };
    expect(args.to).toBe("alex.demo@example.com");
    expect(args.subject).toBe("Your Codechella passport");
    expect(args.html).toContain("https://passport.cursorvictoria.com/00000000-0000-4000-8000-000000000001");
    expect(args.html).toContain("Hi Alex.");
    expect(args.html).toContain("DEMOCODE123");
  });

  test("uses Luma first name and luma fallback when email is unknown", async () => {
    await handleLumaEvent(
      guestUpdated({
        eventId: "evt_codechella",
        email: "unknown.guest@example.com",
        firstName: "Jordan",
      }),
    );

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const args = sendEmailMock.mock.calls[0]![0] as { html: string };
    expect(args.html).toContain("Hi Jordan.");
    expect(args.html).toContain("https://luma.com/cursorvictoria");
  });

  test("skips when event id does not match", async () => {
    await handleLumaEvent(
      guestUpdated({
        eventId: "evt_other",
        email: "alex.demo@example.com",
      }),
    );
    expect(sendEmailMock).toHaveBeenCalledTimes(0);
  });

  test("skips when not checked in", async () => {
    await handleLumaEvent(
      guestUpdated({
        eventId: "evt_codechella",
        email: "alex.demo@example.com",
        checkedIn: false,
      }),
    );
    expect(sendEmailMock).toHaveBeenCalledTimes(0);
  });
});
