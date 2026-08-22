import { createElement } from "react";
import { render } from "react-email";
import {
  CodechellaPassportEmail,
  LOGO_DARK_CONTENT_ID,
  LOGO_LIGHT_CONTENT_ID,
} from "./emails/codechella-passport-email";
import { CursorCreditsEmail, HERO_CONTENT_ID } from "./emails/cursor-credits-email";

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

/** Legacy credits email still uses a CID hero; passport email uses a remote hero URL. */
export const emailHeroAttachment = {
  path: `${import.meta.dir}/emails/static/cursor-credits-hero.jpg`,
  filename: "cursor-credits-hero.jpg",
  contentType: "image/jpeg",
  contentId: HERO_CONTENT_ID,
} as const;

export const passportEmailAttachments = [
  emailLogoLightAttachment,
  emailLogoDarkAttachment,
] as const;

export const emailAttachments = [
  emailLogoLightAttachment,
  emailLogoDarkAttachment,
  emailHeroAttachment,
] as const;

type EmailAttachmentDef = {
  path: string;
  filename: string;
  contentType: string;
  contentId: string;
};

type LoadedAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  contentId: string;
};

let cachedPassportAttachments: Promise<LoadedAttachment[]> | undefined;
let cachedCreditsAttachments: Promise<LoadedAttachment[]> | undefined;

async function loadAttachments(defs: readonly EmailAttachmentDef[]): Promise<LoadedAttachment[]> {
  return Promise.all(
    defs.map(async (attachment) => ({
      filename: attachment.filename,
      content: Buffer.from(await Bun.file(attachment.path).arrayBuffer()),
      contentType: attachment.contentType,
      contentId: attachment.contentId,
    })),
  );
}

export async function getPassportEmailAttachments(): Promise<LoadedAttachment[]> {
  if (!cachedPassportAttachments) {
    cachedPassportAttachments = loadAttachments(passportEmailAttachments);
  }
  return cachedPassportAttachments;
}

/** @deprecated Prefer getPassportEmailAttachments for check-in emails. */
export async function getEmailAttachments(): Promise<LoadedAttachment[]> {
  if (!cachedCreditsAttachments) {
    cachedCreditsAttachments = loadAttachments(emailAttachments);
  }
  return cachedCreditsAttachments;
}

export async function renderCodechellaPassportEmailHtml(params: {
  firstName: string;
  passportUrl: string;
  cursorReferralUrl?: string;
  cursorCode?: string;
}): Promise<string> {
  return render(
    createElement(CodechellaPassportEmail, {
      firstName: params.firstName,
      passportUrl: params.passportUrl,
      cursorReferralUrl: params.cursorReferralUrl,
      cursorCode: params.cursorCode,
      preview: false,
    }),
  );
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
