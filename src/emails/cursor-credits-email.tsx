import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Row,
  Column,
  Section,
  Text,
} from "react-email";

const CURSOR_URL = "https://cursor.com";
export const HERO_CONTENT_ID = "cursor-credits-hero";
export const LOGO_CONTENT_ID = "cursor-logo";

export interface CursorCreditsEmailProps {
  name: string;
}

export function CursorCreditsEmail({ name }: CursorCreditsEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Your Cursor credits</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Row>
              <Column style={logoImageColumn}>
                <Img
                  src={`cid:${LOGO_CONTENT_ID}`}
                  alt="Cursor"
                  width={28}
                  height={28}
                  style={logoImage}
                />
              </Column>
              <Column style={logoTextColumn}>
                <Text style={logoText}>CURSOR</Text>
              </Column>
            </Row>
          </Section>

          <Section style={heroSection}>
            <Img
              src={`cid:${HERO_CONTENT_ID}`}
              alt="Cursor logo on dark background"
              width={560}
              style={heroImage}
            />
          </Section>

          <Section style={headingSection}>
            <Heading style={heading}>Here is your Cursor credits</Heading>
          </Section>

          <Section style={paragraphSection}>
            <Text style={paragraph}>
              Hi {name}, your credits are ready in your account — available to spend on usage
              beyond your plan&apos;s included limits.
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button href={CURSOR_URL} style={button}>
              AGM →
            </Button>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>Keep shipping</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  margin: 0,
  padding: 0,
  backgroundColor: "#ffffff",
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

const logoImageColumn = {
  width: "28px",
  paddingRight: "10px",
  verticalAlign: "middle",
} as const;

const logoTextColumn = {
  verticalAlign: "middle",
} as const;

const logoImage = {
  display: "block",
  border: 0,
  outline: "none",
  textDecoration: "none",
} as const;

const logoText = {
  margin: 0,
  fontSize: "18px",
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#171717",
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
