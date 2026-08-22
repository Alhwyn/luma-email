import { describe, expect, test } from "bun:test";
import { renderCodechellaPassportEmailHtml } from "./email-template";
import { lookupPassportByEmail } from "./passports";
import { FALLBACK_PASSPORT_URL, SHARED_CREDITS } from "./shared-credits";

describe("lookupPassportByEmail", () => {
  test("matches sample guest by lowercase email", () => {
    const guest = lookupPassportByEmail("Alex.Demo@example.com");
    expect(guest?.passportId).toBe("00000000-0000-4000-8000-000000000001");
    expect(guest?.passportUrl).toContain(guest!.passportId);
    expect(guest?.cursorReferralUrl).toContain("DEMOCODE123");
  });

  test("returns undefined for unknown email", () => {
    expect(lookupPassportByEmail("nobody@example.com")).toBeUndefined();
  });
});

describe("renderCodechellaPassportEmailHtml", () => {
  test("includes passport CTA, shared credits, and unique cursor link", async () => {
    const html = await renderCodechellaPassportEmailHtml({
      firstName: "Alex",
      passportUrl: "https://passport.cursorvictoria.com/00000000-0000-4000-8000-000000000001",
      cursorReferralUrl: "https://cursor.com/referral?code=DEMOCODE123",
    });

    expect(html).toContain("Your Codechella passport is ready");
    expect(html).toContain("Hi Alex. Here is your passport and credits.");
    expect(html).toContain("Open passport");
    expect(html).toContain("https://passport.cursorvictoria.com/00000000-0000-4000-8000-000000000001");
    expect(html).toContain("https://cursor.com/referral?code=DEMOCODE123");
    expect(html).toContain(SHARED_CREDITS.firecrawl);
    expect(html).toContain(SHARED_CREDITS.exa);
    expect(html).toContain(SHARED_CREDITS.render);
    expect(html).toContain(SHARED_CREDITS.wisprFlowUrl);
    expect(html).toContain(SHARED_CREDITS.elevenLabsGuideUrl);
    expect(html).toContain(SHARED_CREDITS.convexHackathonUrl);
    expect(html).toContain("Codechella · Victoria, BC · August 22");
    expect(html).toContain("https://passport.cursorvictoria.com/assets/victoria-parliament.png");
  });

  test("fallback passport URL is documented constant", () => {
    expect(FALLBACK_PASSPORT_URL).toBe("https://luma.com/cursorvictoria");
  });
});
