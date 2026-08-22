import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "react-email";
import { PASSPORT_HERO_URL, SHARED_CREDITS } from "../shared-credits";

export const LOGO_LIGHT_CONTENT_ID = "cursor-lockup-light";
export const LOGO_DARK_CONTENT_ID = "cursor-lockup-dark";

export interface CodechellaPassportEmailProps {
  firstName: string;
  passportUrl: string;
  cursorReferralUrl?: string;
  cursorCode?: string;
  /** Use static image paths for React Email preview; cid attachments when sending. */
  preview?: boolean;
}

function logoLightSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-light.png" : `cid:${LOGO_LIGHT_CONTENT_ID}`;
}

function logoDarkSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-dark.png" : `cid:${LOGO_DARK_CONTENT_ID}`;
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
    .email-credit { color: #d4d4d8 !important; }
    .email-footer { color: #a1a1aa !important; }
    .email-divider { border-color: #3f3f46 !important; }
    .email-link { color: #93c5fd !important; }
  }
`;

export function CodechellaPassportEmail({
  firstName,
  passportUrl,
  cursorReferralUrl,
  cursorCode,
  preview = false,
}: CodechellaPassportEmailProps) {
  const greeting = firstName.trim() || "there";
  const cursorLine =
    cursorReferralUrl?.trim() ||
    (cursorCode?.trim() ? `https://cursor.com/referral?code=${cursorCode.trim()}` : undefined);

  return (
    <Html lang="en">
      <Head>
        <title>Your Codechella passport</title>
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

          <Section style={heroSection}>
            <Img
              src={PASSPORT_HERO_URL}
              alt="Victoria Parliament Buildings"
              width={560}
              style={heroImage}
            />
          </Section>

          <Section style={headingSection}>
            <Heading style={heading} className="email-heading">
              Your Codechella passport is ready
            </Heading>
          </Section>

          <Section style={paragraphSection}>
            <Text style={paragraph} className="email-paragraph">
              {`Hi ${greeting}. Here is your passport and credits.`}
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button href={passportUrl} style={button}>
              Open passport
            </Button>
          </Section>

          <Section style={creditsSection}>
            <Text style={creditsHeading} className="email-heading">
              Your credits
            </Text>
            {cursorLine ? (
              <Text style={creditLine} className="email-credit">
                Cursor:{" "}
                <Link href={cursorLine} style={link} className="email-link">
                  {cursorLine}
                </Link>
              </Text>
            ) : null}
            <Text style={creditLine} className="email-credit">
              Firecrawl: {SHARED_CREDITS.firecrawl}
            </Text>
            <Text style={creditLine} className="email-credit">
              Exa: {SHARED_CREDITS.exa}
            </Text>
            <Text style={creditLine} className="email-credit">
              Render: {SHARED_CREDITS.render}
            </Text>
            <Text style={creditLine} className="email-credit">
              Wispr Flow:{" "}
              <Link href={SHARED_CREDITS.wisprFlowUrl} style={link} className="email-link">
                {SHARED_CREDITS.wisprFlowUrl}
              </Link>
            </Text>
            <Text style={creditLine} className="email-credit">
              ElevenLabs guide:{" "}
              <Link href={SHARED_CREDITS.elevenLabsGuideUrl} style={link} className="email-link">
                {SHARED_CREDITS.elevenLabsGuideUrl}
              </Link>
            </Text>
            <Text style={creditLine} className="email-credit">
              Convex:{" "}
              <Link href={SHARED_CREDITS.convexHackathonUrl} style={link} className="email-link">
                {SHARED_CREDITS.convexHackathonUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={divider} className="email-divider" />
          <Text style={footer} className="email-footer">
            Codechella · Victoria, BC · August 22
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

const heroSection = {
  padding: "0 0 28px",
} as const;

const heroImage = {
  display: "block",
  width: "100%",
  maxWidth: "560px",
  height: "auto",
  border: 0,
  borderRadius: "12px",
  outline: "none",
  textDecoration: "none",
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
  padding: "0 0 28px",
} as const;

const paragraph = {
  margin: 0,
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#52525b",
} as const;

const buttonSection = {
  padding: "0 0 32px",
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

const creditsSection = {
  padding: "0 0 8px",
} as const;

const creditsHeading = {
  margin: "0 0 12px",
  fontSize: "16px",
  lineHeight: 1.4,
  fontWeight: 600,
  color: "#171717",
} as const;

const creditLine = {
  margin: "0 0 10px",
  fontSize: "15px",
  lineHeight: 1.55,
  color: "#52525b",
  wordBreak: "break-word" as const,
} as const;

const link = {
  color: "#171717",
  textDecoration: "underline",
} as const;

const divider = {
  borderColor: "#e4e4e7",
  margin: "24px 0 0",
} as const;

const footer = {
  margin: "24px 0 0",
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#71717a",
} as const;

export default CodechellaPassportEmail;

CodechellaPassportEmail.PreviewProps = {
  firstName: "Alex",
  passportUrl: "https://passport.cursorvictoria.com/00000000-0000-4000-8000-000000000001",
  cursorReferralUrl: "https://cursor.com/referral?code=DEMOCODE123",
  cursorCode: "DEMOCODE123",
  preview: true,
} satisfies CodechellaPassportEmailProps;
