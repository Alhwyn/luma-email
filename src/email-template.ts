import { createElement } from "react";
import { render } from "react-email";
import {
  CursorCreditsEmail,
  HERO_CONTENT_ID,
  LOGO_CONTENT_ID,
} from "./emails/cursor-credits-email";

export const emailHeroAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-credits-hero.jpg`,
  filename: "cursor-credits-hero.jpg",
  contentType: "image/jpeg",
  contentId: HERO_CONTENT_ID,
} as const;

export const emailLogoAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-logo.png`,
  filename: "cursor-logo.png",
  contentType: "image/png",
  contentId: LOGO_CONTENT_ID,
} as const;

export const emailAttachments = [emailLogoAttachment, emailHeroAttachment] as const;

export async function renderCursorCreditsEmailHtml(params: { name: string }): Promise<string> {
  return render(createElement(CursorCreditsEmail, { name: params.name }));
}
