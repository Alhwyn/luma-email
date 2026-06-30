const HERO_CONTENT_ID = "cursor-credits-hero";
const LOGO_CONTENT_ID = "cursor-logo";
const CURSOR_URL = "https://cursor.com";

export const emailHeroAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-credits-hero.png`,
  filename: "cursor-credits-hero.png",
  contentType: "image/png",
  contentId: HERO_CONTENT_ID,
} as const;

export const emailLogoAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-logo.png`,
  filename: "cursor-logo.png",
  contentType: "image/png",
  contentId: LOGO_CONTENT_ID,
} as const;

export const emailAttachments = [emailLogoAttachment, emailHeroAttachment] as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCursorCreditsEmailHtml(params: { name: string }): string {
  const name = escapeHtml(params.name);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Cursor credits</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#171717;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td align="left" style="padding:0 0 28px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:10px;vertical-align:middle;">
                      <img
                        src="cid:${LOGO_CONTENT_ID}"
                        alt="Cursor"
                        width="28"
                        height="28"
                        style="display:block;border:0;outline:none;text-decoration:none;"
                      />
                    </td>
                    <td style="vertical-align:middle;font-size:18px;line-height:1;font-weight:700;letter-spacing:0.08em;color:#171717;">
                      CURSOR
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0 0 28px;">
                <img
                  src="cid:${HERO_CONTENT_ID}"
                  alt="Cursor credits"
                  width="560"
                  style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:12px;outline:none;text-decoration:none;"
                />
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0 0 16px;">
                <h1 style="margin:0;font-size:28px;line-height:1.25;font-weight:700;color:#171717;">
                  Here is your Cursor credits
                </h1>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0 0 28px;">
                <p style="margin:0;font-size:16px;line-height:1.6;color:#52525b;">
                  Hi ${name}, your credits are ready in your account — available to spend on usage beyond your plan's included limits.
                </p>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0 0 32px;">
                <a
                  href="${CURSOR_URL}"
                  style="display:inline-block;background-color:#171717;color:#ffffff;font-size:15px;font-weight:500;line-height:1;text-decoration:none;padding:14px 20px;border-radius:8px;"
                >
                  AGM &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0;border-top:1px solid #e4e4e7;">
                <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#71717a;">
                  Keep shipping
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
