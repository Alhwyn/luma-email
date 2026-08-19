import { describe, expect, test } from "bun:test";
import { parseCsv, stringifyCsv } from "./csv";
import {
  buildLinkedInSearchQuery,
  buildXSearchQuery,
  parseLinkedInProfile,
  parseXHandle,
} from "./handles";
import { emptyEnrichment, enrichGuest, mergeEnrichment, mergeHeaders } from "./enrich";
import { ENRICHMENT_COLUMNS, LUMA_COLUMNS } from "./types";
import { resetRateLimitClock } from "./resolve";

describe("parseXHandle", () => {
  test("parses x.com URL", () => {
    expect(parseXHandle("https://x.com/__Seismic__")).toBe("__Seismic__");
  });

  test("parses twitter.com URL with @ and path junk", () => {
    expect(parseXHandle("https://twitter.com/@ada_example/status/1")).toBe("ada_example");
  });

  test("parses bare @handle and handle", () => {
    expect(parseXHandle("@blake_sample")).toBe("blake_sample");
    expect(parseXHandle("blake_sample")).toBe("blake_sample");
  });

  test("returns null for empty or invalid", () => {
    expect(parseXHandle("")).toBeNull();
    expect(parseXHandle("not a handle!!")).toBeNull();
    expect(parseXHandle(null)).toBeNull();
  });
});

describe("parseLinkedInProfile", () => {
  test("parses full in/ URL", () => {
    expect(parseLinkedInProfile("https://www.linkedin.com/in/ada-example")).toEqual({
      url: "https://www.linkedin.com/in/ada-example",
      username: "ada-example",
      kind: "user",
    });
  });

  test("parses host without scheme", () => {
    expect(parseLinkedInProfile("linkedin.com/in/dana-linked")?.username).toBe("dana-linked");
  });

  test("parses company URL", () => {
    expect(parseLinkedInProfile("https://www.linkedin.com/company/acme")).toEqual({
      url: "https://www.linkedin.com/company/acme",
      username: "acme",
      kind: "company",
    });
  });

  test("returns null for empty", () => {
    expect(parseLinkedInProfile("")).toBeNull();
  });
});

describe("search queries", () => {
  test("records name + company + city for X and LinkedIn", () => {
    expect(
      buildXSearchQuery({
        name: "Casey NoHandles",
        company: "Acme Robotics",
        location: "Toronto, ON",
      }),
    ).toBe('"Casey NoHandles" Acme Robotics Toronto, ON site:x.com');

    expect(
      buildLinkedInSearchQuery({
        name: "Casey NoHandles",
        company: "Acme Robotics",
        location: "Toronto, ON",
      }),
    ).toBe('"Casey NoHandles" Acme Robotics Toronto, ON site:linkedin.com/in');
  });
});

describe("csv round-trip", () => {
  test("preserves survey headers and quoted commas", () => {
    const csv = [
      `guest_id,name,"What is your X (Twitter) handle?","Where are you based?"`,
      `gst-1,Ada,@ada,"San Francisco, CA"`,
      "",
    ].join("\n");

    const { headers, rows } = parseCsv(csv);
    expect(headers).toContain(LUMA_COLUMNS.x);
    expect(rows[0]?.[LUMA_COLUMNS.x]).toBe("@ada");
    expect(rows[0]?.[LUMA_COLUMNS.location]).toBe("San Francisco, CA");

    const out = stringifyCsv(headers, rows);
    const again = parseCsv(out);
    expect(again.rows[0]?.[LUMA_COLUMNS.location]).toBe("San Francisco, CA");
  });

  test("mergeHeaders appends enrichment columns once", () => {
    const headers = mergeHeaders(["guest_id", "name"]);
    expect(headers.slice(0, 2)).toEqual(["guest_id", "name"]);
    for (const col of ENRICHMENT_COLUMNS) {
      expect(headers).toContain(col);
    }
    expect(mergeHeaders(headers).filter((h) => h === "x_handle").length).toBe(1);
  });
});

describe("enrichGuest", () => {
  test("dry-run fills handle fields and avatar urls without fetching", async () => {
    const row = {
      [LUMA_COLUMNS.guestId]: "gst-fixture-001",
      [LUMA_COLUMNS.name]: "Ada Example",
      [LUMA_COLUMNS.x]: "https://x.com/ada_example",
      [LUMA_COLUMNS.linkedin]: "https://www.linkedin.com/in/ada-example",
    };

    const enrichment = await enrichGuest(row, {
      avatarsDir: "avatars",
      dryRun: true,
    });

    expect(enrichment.x_handle).toBe("ada_example");
    expect(enrichment.linkedin_url).toBe("https://www.linkedin.com/in/ada-example");
    expect(enrichment.x_avatar_url).toContain("/x/ada_example");
    expect(enrichment.linkedin_avatar_url).toContain("linkedin");
    expect(enrichment.avatar_source).toBe("x");
    expect(enrichment.avatar_status).toBe("ok");
    expect(enrichment.x_avatar_path).toBe("avatars/gst-fixture-001-x.png");
  });

  test("records search query when handles missing", async () => {
    const row = {
      [LUMA_COLUMNS.guestId]: "gst-fixture-003",
      [LUMA_COLUMNS.name]: "Casey NoHandles",
      [LUMA_COLUMNS.company]: "Acme Robotics",
      [LUMA_COLUMNS.location]: "Toronto, ON",
      [LUMA_COLUMNS.x]: "",
      [LUMA_COLUMNS.linkedin]: "",
    };

    const enrichment = await enrichGuest(row, {
      avatarsDir: "avatars",
      dryRun: true,
    });

    expect(enrichment.x_search_query).toContain("Casey NoHandles");
    expect(enrichment.linkedin_search_query).toContain("site:linkedin.com/in");
    expect(enrichment.avatar_status).toBe("not_found");
    expect(enrichment.avatar_source).toBe("none");
  });

  test("writes enrichment columns onto a guest row", () => {
    const base = emptyEnrichment();
    base.x_handle = "ada_example";
    base.avatar_status = "ok";
    base.avatar_source = "x";

    const merged = mergeEnrichment({ guest_id: "gst-1", name: "Ada" }, base);
    expect(merged.guest_id).toBe("gst-1");
    expect(merged.x_handle).toBe("ada_example");
    expect(merged.avatar_status).toBe("ok");
  });

  test("fetches and writes PNG when mock returns image", async () => {
    resetRateLimitClock();
    const png = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
      0x00, 0x05, 0xfe, 0x02, 0xfe, 0xa7, 0x35, 0x81, 0x84, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const tmpDir = await Bun.$`mktemp -d`.text().then((t) => t.trim());

    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/x/")) {
        return new Response(png, { status: 200, headers: { "content-type": "image/png" } });
      }
      return new Response(null, { status: 404 });
    };

    const enrichment = await enrichGuest(
      {
        [LUMA_COLUMNS.guestId]: "gst-mock-1",
        [LUMA_COLUMNS.name]: "Mock User",
        [LUMA_COLUMNS.x]: "@mock_user",
        [LUMA_COLUMNS.linkedin]: "https://www.linkedin.com/in/mock-user",
      },
      {
        avatarsDir: tmpDir,
        delayMs: 0,
        fetchImpl,
      },
    );

    expect(enrichment.avatar_status).toBe("partial");
    expect(enrichment.avatar_source).toBe("x");
    expect(enrichment.x_avatar_path).toBe(`${tmpDir}/gst-mock-1-x.png`);
    expect(await Bun.file(enrichment.x_avatar_path).exists()).toBe(true);
    expect(enrichment.linkedin_avatar_path).toBe("");

    await Bun.$`rm -rf ${tmpDir}`.quiet();
  });
});

describe("fixture CSV", () => {
  test("sample fixture parses with expected survey columns", async () => {
    const text = await Bun.file(new URL("../../fixtures/guests.sample.csv", import.meta.url)).text();
    const { headers, rows } = parseCsv(text);
    expect(rows.length).toBe(4);
    expect(headers).toContain(LUMA_COLUMNS.linkedin);
    expect(headers).toContain(LUMA_COLUMNS.x);
    expect(parseXHandle(rows[0]?.[LUMA_COLUMNS.x])).toBe("ada_example");
  });
});
