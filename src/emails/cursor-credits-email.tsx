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

const CURSOR_URL = "https://cursor.com";
export const HERO_CONTENT_ID = "cursor-credits-hero";
export const LOGO_LIGHT_CONTENT_ID = "cursor-lockup-light";
export const LOGO_DARK_CONTENT_ID = "cursor-lockup-dark";

export interface CursorCreditsEmailProps {
  eventName: string;
  /** Use static image paths for React Email preview; cid attachments when sending. */
  preview?: boolean;
}

function logoLightSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-light.png" : `cid:${LOGO_LIGHT_CONTENT_ID}`;
}

function logoDarkSrc(preview: boolean): string {
  return preview ? "/static/cursor-lockup-dark.png" : `cid:${LOGO_DARK_CONTENT_ID}`;
}

function heroSrc(preview: boolean): string {
  return preview ? "/static/cursor-credits-hero.jpg" : `cid:${HERO_CONTENT_ID}`;
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
    .email-footer { color: #a1a1aa !important; }
    .email-divider { border-color: #3f3f46 !important; }
  }
`;

export function CursorCreditsEmail({ eventName, preview = false }: CursorCreditsEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Your Cursor credits</title>
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
              src={heroSrc(preview)}
              alt="Cursor logo on dark background"
              width={560}
              style={heroImage}
            />
          </Section>

          <Section style={headingSection}>
            <Heading style={heading} className="email-heading">
              Thanks for joining {eventName}
            </Heading>
          </Section>

          <Section style={paragraphSection}>
            <Text style={paragraph} className="email-paragraph">
              Here are your Cursor credits.
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button href={CURSOR_URL} style={button}>
              Redeem
            </Button>
          </Section>

          <Hr style={divider} className="email-divider" />
          <Text style={footer} className="email-footer">
            Keep shipping
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

export default CursorCreditsEmail;

CursorCreditsEmail.PreviewProps = {
  eventName: "Cursor Victoria Meetup",
  preview: true,
} satisfies CursorCreditsEmailProps;
