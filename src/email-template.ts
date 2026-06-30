import { createElement } from "react";
import { render } from "react-email";
import {
  CursorCreditsEmail,
  HERO_CONTENT_ID,
  LOGO_DARK_CONTENT_ID,
  LOGO_LIGHT_CONTENT_ID,
} from "./emails/cursor-credits-email";

export const emailHeroAttachment = {
  path: `${import.meta.dir}/emails/static/cursor-credits-hero.jpg`,
  filename: "cursor-credits-hero.jpg",
  contentType: "image/jpeg",
  contentId: HERO_CONTENT_ID,
} as const;

export const emailLogoLightAttachment = {
  path: `${import.meta.dir}/emails/static/cursor-lockup-light.png`,
  filename: "cursor-lockup-light.png",
  contentType: "image/png",
  contentId: LOGO_LIGHT_CONTENT_ID,
} as const;

export const emailLogoDarkAttachment = {
  path: `${import.meta.dir}/emails/static/cursor-lockup-dark.png`,
  filename: "cursor-lockup-dark.png",
  contentType: "image/png",
  contentId: LOGO_DARK_CONTENT_ID,
} as const;

export const emailAttachments = [
  emailLogoLightAttachment,
  emailLogoDarkAttachment,
  emailHeroAttachment,
] as const;

type EmailAttachmentDef = (typeof emailAttachments)[number];

let cachedAttachments: Promise<
  {
    filename: string;
    content: Buffer;
    contentType: string;
    contentId: string;
  }[]
> | undefined;

export async function getEmailAttachments() {
  if (!cachedAttachments) {
    cachedAttachments = Promise.all(
      emailAttachments.map(async (attachment: EmailAttachmentDef) => ({
        filename: attachment.filename,
        content: Buffer.from(await Bun.file(attachment.path).arrayBuffer()),
        contentType: attachment.contentType,
        contentId: attachment.contentId,
      })),
    );
  }

  return cachedAttachments;
}

export async function renderCursorCreditsEmailHtml(params: {
  eventName: string;
}): Promise<string> {
  return render(
    createElement(CursorCreditsEmail, {
      eventName: params.eventName,
      preview: false,
    }),
  );
}
