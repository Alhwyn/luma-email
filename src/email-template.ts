const LOGO_CONTENT_ID = "resend-logo";

export const emailLogoAttachment = {
  path: `${import.meta.dir}/../assets/email/resend-logo.png`,
  filename: "resend-logo.png",
  contentType: "image/png",
  contentId: LOGO_CONTENT_ID,
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderEmailHtml(params: {
  greeting: string;
  body: string;
}): string {
  const greeting = escapeHtml(params.greeting);
  const body = escapeHtml(params.body);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Event update</title>
  </head>
  <body style="margin:0;padding:0;background-color:#000000;font-family:Inter,Arial,sans-serif;color:#f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="background-color:#1f1f23;border-radius:16px;border:1px solid #2f2f35;">
                  <tr>
                    <td align="center" style="padding:28px 40px;">
                      <img
                        src="cid:${LOGO_CONTENT_ID}"
                        alt="Resend"
                        width="72"
                        height="72"
                        style="display:block;border:0;outline:none;text-decoration:none;"
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#111113;border-radius:16px;border:1px solid #27272a;padding:32px 28px;">
                <p style="margin:0 0 16px;font-size:18px;line-height:1.5;font-weight:600;color:#fafafa;">
                  ${greeting}
                </p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#d4d4d8;">
                  ${body}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 0 0;font-size:12px;line-height:1.5;color:#71717a;">
                Sent with Resend
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
