import { createElement } from "react";
import { render } from "react-email";
import {
  CursorCreditsEmail,
  HERO_CONTENT_ID,
  LOGO_DARK_CONTENT_ID,
  LOGO_LIGHT_CONTENT_ID,
} from "./emails/cursor-credits-email";

export const emailHeroAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-credits-hero.jpg`,
  filename: "cursor-credits-hero.jpg",
  contentType: "image/jpeg",
  contentId: HERO_CONTENT_ID,
} as const;

export const emailLogoLightAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-lockup-light.png`,
  filename: "cursor-lockup-light.png",
  contentType: "image/png",
  contentId: LOGO_LIGHT_CONTENT_ID,
} as const;

export const emailLogoDarkAttachment = {
  path: `${import.meta.dir}/../assets/email/cursor-lockup-dark.png`,
  filename: "cursor-lockup-dark.png",
  contentType: "image/png",
  contentId: LOGO_DARK_CONTENT_ID,
} as const;

export const emailAttachments = [
  emailLogoLightAttachment,
  emailLogoDarkAttachment,
  emailHeroAttachment,
] as const;

export async function renderCursorCreditsEmailHtml(params: { name: string }): Promise<string> {
  return render(createElement(CursorCreditsEmail, { name: params.name, preview: false }));
}
