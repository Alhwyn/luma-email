import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "react-email";
import { victoriaEventConfig } from "../event-config";
import { ticketOneLiner } from "../expect-email/ticket-copy";

export const LOGO_LIGHT_CONTENT_ID = "cursor-lockup-light";
export const LOGO_DARK_CONTENT_ID = "cursor-lockup-dark";

export interface CursorVictoriaExpectEmailProps {
  firstName: string;
  name?: string;
  /** Guest photo URL. Omit or leave empty for an initial circle. */
  avatarUrl?: string;
  /** e.g. "Standard" or "Watch the Demos" */
  ticketName: string;
  city?: string;
  /** From the travel survey; true/false or raw answer string */
  travelingToVictoria?: boolean | string;
  company?: string;
  eventName?: string;
  venue?: string;
  date?: string;
  lumaUrl?: string;
  /** Use static image paths for React Email preview; cid attachments when sending. */
  preview?: boolean;
}

function logoLightSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-light.png" : `cid:${LOGO_LIGHT_CONTENT_ID}`;
}

function logoDarkSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-dark.png" : `cid:${LOGO_DARK_CONTENT_ID}`;
}

function travelLine(args: {
  city?: string;
  travelingToVictoria?: boolean | string;
}): string | null {
  const traveling =
    typeof args.travelingToVictoria === "boolean"
      ? args.travelingToVictoria
      : typeof args.travelingToVictoria === "string"
        ? /^(yes|y|true|1)$/i.test(args.travelingToVictoria.trim())
        : undefined;

  if (traveling === true && args.city) {
    return `You are coming in from ${args.city}. Safe travels, and see you in Victoria.`;
  }
  if (traveling === true) {
    return "You are traveling to Victoria for this. Safe travels, and see you soon.";
  }
  if (traveling === false && args.city) {
    return `Based in ${args.city}. Glad you can join us locally.`;
  }
  if (args.city) {
    return `Based in ${args.city}.`;
  }
  return null;
}

function initialFromName(firstName: string, name?: string): string {
  const source = (firstName || name || "?").trim();
  return source.charAt(0).toUpperCase() || "?";
}

const darkModeStyles = `
  .logo-light { display: block !important; }
  .logo-dark { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
  @media (prefers-color-scheme: dark) {
    .logo-light { display: none !important; max-height: 0 !important; overflow: hidden !important; mso-hide: all !important; }
    .logo-dark { display: block !important; max-height: none !important; overflow: visible !important; }
    .email-body { background-color: #171717 !important; }
    .email-container { background-color: #171717 !important; }
    .email-heading { color: #fafafa !important; }
    .email-paragraph { color: #d4d4d8 !important; }
    .email-muted { color: #a1a1aa !important; }
    .email-footer { color: #a1a1aa !important; }
    .email-divider { border-color: #3f3f46 !important; }
    .avatar-fallback { background-color: #3f3f46 !important; color: #fafafa !important; }
  }
`;

export function CursorVictoriaExpectEmail({
  firstName,
  name,
  avatarUrl,
  ticketName,
  city,
  travelingToVictoria,
  company,
  eventName = victoriaEventConfig.eventName,
  venue = victoriaEventConfig.venue,
  date = victoriaEventConfig.date,
  lumaUrl = victoriaEventConfig.lumaUrl,
  preview = false,
}: CursorVictoriaExpectEmailProps) {
  const greetingName = firstName.trim() || name?.trim() || "there";
  const oneLiner = ticketOneLiner(ticketName);
  const travel = travelLine({ city, travelingToVictoria });
  const hasAvatar = Boolean(avatarUrl?.trim());
  const initial = initialFromName(firstName, name);
  const metaBits = [date, venue].filter((bit) => bit && bit.trim().length > 0);

  return (
    <Html lang="en">
      <Head>
        <title>{`What to expect at ${eventName}`}</title>
        <style>{darkModeStyles}</style>
      </Head>
      <Body style={main} className="email-body">
        <Container style={container} className="email-container">
          <Section style={logoSection}>
            <Img
              src={logoLightSrc(preview)}
              alt="Cursor"
              width={120}
              height={29}
              className="logo-light"
              style={lockupImage}
            />
            <Img
              src={logoDarkSrc(preview)}
              alt="Cursor"
              width={120}
              height={29}
              className="logo-dark"
              style={lockupImage}
            />
          </Section>

          <Section style={profileSection}>
            {hasAvatar ? (
              <Img
                src={avatarUrl!.trim()}
                alt={name?.trim() || greetingName}
                width={64}
                height={64}
                style={avatarImage}
              />
            ) : (
              <Text style={avatarFallback} className="avatar-fallback">
                {initial}
              </Text>
            )}
            <Text style={profileName} className="email-heading">
              {name?.trim() || greetingName}
            </Text>
            {company?.trim() ? (
              <Text style={profileMeta} className="email-muted">
                {company.trim()}
              </Text>
            ) : null}
            <Text style={profileMeta} className="email-muted">
              {ticketName.trim() || "Guest"}
            </Text>
          </Section>

          <Section style={headingSection}>
            <Heading style={heading} className="email-heading">
              {`Hi ${greetingName}, here is what to expect`}
            </Heading>
          </Section>

          <Section style={paragraphSection}>
            <Text style={paragraph} className="email-paragraph">
              {`${eventName} is a Cursor-hosted hackathon and builder day in Victoria. Come ready to meet people, ship something, and share what you made.`}
            </Text>
          </Section>

          <Section style={paragraphSection}>
            <Text style={paragraph} className="email-paragraph">
              {oneLiner}
            </Text>
          </Section>

          {travel ? (
            <Section style={paragraphSection}>
              <Text style={paragraph} className="email-paragraph">
                {travel}
              </Text>
            </Section>
          ) : null}

          <Section style={paragraphSection}>
            <Text style={paragraph} className="email-paragraph">
              Bring a laptop, charger, and curiosity. Rough flow: arrive, meet people, build,
              then demos. When you check in on the day, you will get a separate email with Cursor
              credits and tools. This note is just the briefing.
            </Text>
          </Section>

          {metaBits.length > 0 ? (
            <Section style={paragraphSection}>
              <Text style={paragraph} className="email-paragraph">
                {metaBits.join(" · ")}
              </Text>
            </Section>
          ) : null}

          {lumaUrl?.trim() ? (
            <Section style={buttonSection}>
              <Button href={lumaUrl.trim()} style={button}>
                Event page
              </Button>
            </Section>
          ) : null}

          <Hr style={divider} className="email-divider" />
          <Text style={footer} className="email-footer">
            See you in Victoria
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  margin: 0,
  padding: 0,
  backgroundColor: "#fcfcf9",
  fontFamily: "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
  color: "#171717",
} as const;

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 20px",
} as const;

const logoSection = {
  padding: "0 0 28px",
} as const;

const lockupImage = {
  display: "block",
  border: 0,
  outline: "none",
  textDecoration: "none",
} as const;

const profileSection = {
  padding: "0 0 28px",
} as const;

const avatarImage = {
  display: "block",
  width: "64px",
  height: "64px",
  borderRadius: "999px",
  objectFit: "cover" as const,
  border: 0,
  outline: "none",
  marginBottom: "12px",
} as const;

const avatarFallback = {
  display: "inline-block",
  width: "64px",
  height: "64px",
  lineHeight: "64px",
  textAlign: "center" as const,
  borderRadius: "999px",
  backgroundColor: "#e4e4e7",
  color: "#171717",
  fontSize: "22px",
  fontWeight: 600,
  margin: "0 0 12px",
} as const;

const profileName = {
  margin: "0 0 4px",
  fontSize: "18px",
  lineHeight: 1.4,
  fontWeight: 600,
  color: "#171717",
} as const;

const profileMeta = {
  margin: "0 0 2px",
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#71717a",
} as const;

const headingSection = {
  padding: "0 0 16px",
} as const;

const heading = {
  margin: 0,
  fontSize: "28px",
  lineHeight: 1.25,
  fontWeight: 700,
  color: "#171717",
} as const;

const paragraphSection = {
  padding: "0 0 16px",
} as const;

const paragraph = {
  margin: 0,
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#52525b",
} as const;

const buttonSection = {
  padding: "12px 0 32px",
} as const;

const button = {
  display: "inline-block",
  backgroundColor: "#171717",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: 1,
  textDecoration: "none",
  padding: "14px 20px",
  borderRadius: "8px",
} as const;

const divider = {
  borderColor: "#e4e4e7",
  margin: 0,
} as const;

const footer = {
  margin: "24px 0 0",
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#71717a",
} as const;

export default CursorVictoriaExpectEmail;

CursorVictoriaExpectEmail.PreviewProps = {
  firstName: "Alex",
  name: "Alex Rivera",
  avatarUrl: "https://example.com/avatars/alex.jpg",
  ticketName: "Standard",
  city: "Vancouver, BC",
  travelingToVictoria: true,
  company: "Independent",
  eventName: victoriaEventConfig.eventName,
  venue: victoriaEventConfig.venue || "Victoria, BC",
  date: victoriaEventConfig.date || "Date TBA",
  lumaUrl: victoriaEventConfig.lumaUrl || "https://lu.ma/",
  preview: true,
} satisfies CursorVictoriaExpectEmailProps;
