const HERO_CONTENT_ID = "cursor-credits-hero";
const CURSOR_URL = "https://cursor.com";

export const emailHeroAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-credits-hero.png`,
  filename: "cursor-credits-hero.png",
  contentType: "image/png",
  contentId: HERO_CONTENT_ID,
} as const;

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
  <body style="margin:0;padding:0;background-color:#000000;font-family:Inter,Arial,sans-serif;color:#f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#000000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 24px;">
                <img
                  src="cid:${HERO_CONTENT_ID}"
                  alt="Cursor credits"
                  width="560"
                  style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:16px;outline:none;text-decoration:none;"
                />
              </td>
            </tr>
            <tr>
              <td style="background-color:#111113;border-radius:16px;border:1px solid #27272a;padding:32px 28px;text-align:center;">
                <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#a1a1aa;">
                  Hi ${name},
                </p>
                <p style="margin:0 0 28px;font-size:22px;line-height:1.4;font-weight:600;color:#fafafa;">
                  Here is your Cursor credits
                </p>
                <a
                  href="${CURSOR_URL}"
                  style="display:inline-block;background-color:#fafafa;color:#09090b;font-size:15px;font-weight:600;line-height:1;text-decoration:none;padding:14px 32px;border-radius:999px;"
                >
                  AGM
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
