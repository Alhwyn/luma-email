import { Resend } from "resend";
import { getExpectEmailAttachments, expectEmailSubject, renderExpectEmailHtml } from "./render";
import type { ExpectEmailGuest } from "./types";

export interface SendExpectEmailDeps {
  send: (params: {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments: Awaited<ReturnType<typeof getExpectEmailAttachments>>;
  }) => Promise<{ error: { message: string } | null }>;
  fromEmail: string;
  apiKeyPresent: boolean;
}

export function createResendSendDeps(): SendExpectEmailDeps {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error(
      "Sending requires RESEND_API_KEY and RESEND_FROM_EMAIL. Use --dry-run to preview recipients without sending.",
    );
  }

  const resend = new Resend(apiKey);

  return {
    fromEmail,
    apiKeyPresent: true,
    send: async (params) => {
      const { error } = await resend.emails.send({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      });
      return { error };
    },
  };
}

/**
 * Send a single expect email. Never call this from dry-run paths.
 */
export async function sendExpectEmail(
  guest: ExpectEmailGuest,
  deps: SendExpectEmailDeps,
): Promise<void> {
  if (!deps.apiKeyPresent || !deps.fromEmail) {
    throw new Error("Missing Resend credentials");
  }

  const html = await renderExpectEmailHtml(guest, { preview: false });
  const attachments = await getExpectEmailAttachments();
  const { error } = await deps.send({
    from: deps.fromEmail,
    to: guest.email,
    subject: expectEmailSubject(guest),
    html,
    attachments,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
