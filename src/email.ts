import { Resend } from "resend";
import { emailHeroAttachment } from "./email-template";
import { env } from "./env";

let resend: Resend | undefined;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(env.resendApiKey());
  }
  return resend;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { error } = await getResend().emails.send({
    from: env.emailFrom(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: [emailHeroAttachment],
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
