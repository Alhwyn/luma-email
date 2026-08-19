import { createElement } from "react";
import { render } from "react-email";
import { victoriaEventConfig } from "../event-config";
import {
  CursorVictoriaExpectEmail,
  LOGO_DARK_CONTENT_ID,
  LOGO_LIGHT_CONTENT_ID,
  type CursorVictoriaExpectEmailProps,
} from "../emails/cursor-victoria-expect-email";
import type { ExpectEmailGuest } from "./types";

export const expectEmailLogoLightAttachment = {
  path: `${import.meta.dir}/../emails/static/cursor-lockup-light.png`,
  filename: "cursor-lockup-light.png",
  contentType: "image/png",
  contentId: LOGO_LIGHT_CONTENT_ID,
} as const;

export const expectEmailLogoDarkAttachment = {
  path: `${import.meta.dir}/../emails/static/cursor-lockup-dark.png`,
  filename: "cursor-lockup-dark.png",
  contentType: "image/png",
  contentId: LOGO_DARK_CONTENT_ID,
} as const;

export const expectEmailAttachments = [
  expectEmailLogoLightAttachment,
  expectEmailLogoDarkAttachment,
] as const;

let cachedAttachments: Promise<
  {
    filename: string;
    content: Buffer;
    contentType: string;
    contentId: string;
  }[]
> | undefined;

export async function getExpectEmailAttachments() {
  if (!cachedAttachments) {
    cachedAttachments = Promise.all(
      expectEmailAttachments.map(async (attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(await Bun.file(attachment.path).arrayBuffer()),
        contentType: attachment.contentType,
        contentId: attachment.contentId,
      })),
    );
  }

  return cachedAttachments;
}

export function guestToEmailProps(
  guest: ExpectEmailGuest,
  options?: { preview?: boolean },
): CursorVictoriaExpectEmailProps {
  return {
    firstName: guest.firstName,
    name: guest.name,
    avatarUrl: guest.avatarUrl,
    ticketName: guest.ticketName,
    city: guest.city,
    travelingToVictoria: guest.travelingToVictoria,
    company: guest.company,
    eventName: victoriaEventConfig.eventName,
    venue: victoriaEventConfig.venue,
    date: victoriaEventConfig.date,
    lumaUrl: victoriaEventConfig.lumaUrl,
    preview: options?.preview ?? false,
  };
}

export async function renderExpectEmailHtml(
  guest: ExpectEmailGuest,
  options?: { preview?: boolean },
): Promise<string> {
  return render(createElement(CursorVictoriaExpectEmail, guestToEmailProps(guest, options)));
}

export function expectEmailSubject(guest: ExpectEmailGuest): string {
  const eventName = victoriaEventConfig.eventName;
  const first = guest.firstName || "there";
  return `${first}, what to expect at ${eventName}`;
}
