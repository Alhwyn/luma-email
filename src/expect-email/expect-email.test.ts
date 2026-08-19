import { describe, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { parseCsv } from "./csv";
import { runExpectEmailCli } from "./cli";
import {
  filterApprovedGuests,
  guestsFromCsvRecords,
  mapLumaGuestRow,
  toExpectEmailGuest,
} from "./map-guest";
import { renderExpectEmailHtml } from "./render";
import { classifyTicket, ticketOneLiner } from "./ticket-copy";
import type { SendExpectEmailDeps } from "./send";

const SAMPLE_CSV = `guest_id,name,first_name,email,approval_status,ticket_name,company,Where are you based?,"Are you traveling to Victoria, BC Canada for this?",x_avatar_path
gst_1,Alex Rivera,Alex,alex@example.com,approved,Standard,Indie,"Vancouver, BC",Yes,https://example.com/a.jpg
gst_2,Sam Chen,Sam,sam@example.com,approved,Watch the Demos,,"Victoria, BC",No,
gst_3,Casey Ng,Casey,casey@example.com,pending,Standard,Acme,"Toronto, ON",Yes,
`;

describe("expect-email CSV filter", () => {
  test("keeps approved guests only", () => {
    const guests = filterApprovedGuests(guestsFromCsvRecords(parseCsv(SAMPLE_CSV)));
    expect(guests).toHaveLength(2);
    expect(guests.map((g) => g.guestId)).toEqual(["gst_1", "gst_2"]);
  });

  test("maps survey columns for city and travel", () => {
    const [first] = guestsFromCsvRecords(parseCsv(SAMPLE_CSV));
    expect(first?.city).toBe("Vancouver, BC");
    expect(first?.travelingToVictoria).toBe(true);
    expect(first?.avatarUrl).toBe("https://example.com/a.jpg");
  });
});

describe("ticket-type copy", () => {
  test("standard vs watch the demos branches", () => {
    expect(classifyTicket("Standard")).toBe("standard");
    expect(classifyTicket("Watch the Demos")).toBe("watch_demos");
    expect(ticketOneLiner("Standard")).toContain("build");
    expect(ticketOneLiner("Watch the Demos")).toContain("demos");
    expect(ticketOneLiner("Watch the Demos")).not.toContain("ship something small");
  });
});

describe("missing avatar", () => {
  test("render does not crash without avatar URL", async () => {
    const guest = toExpectEmailGuest(
      mapLumaGuestRow({
        guest_id: "gst_no_avatar",
        name: "No Avatar",
        first_name: "No",
        email: "noavatar@example.com",
        approval_status: "approved",
        ticket_name: "Standard",
      }),
    );

    expect(guest.avatarUrl).toBeUndefined();
    const html = await renderExpectEmailHtml(guest, { preview: true });
    expect(html).toContain("here is what to expect");
    expect(html).toContain(">N<");
    expect(html).toContain("No Avatar");
    expect(html).not.toContain("example.com/avatars");
    // Logos still render as img; guest photo must be omitted.
    expect(html).not.toContain('alt="No Avatar"');
    expect(html).toContain("avatar-fallback");
  });
});

describe("dry-run does not send", () => {
  test("--dry-run lists recipients and never calls send", async () => {
    const tmpRoot = join(import.meta.dir, "../../.tmp-expect-email-test");
    const csvPath = join(tmpRoot, "guests.csv");
    const outDir = join(tmpRoot, "out");
    await mkdir(tmpRoot, { recursive: true });
    await Bun.write(csvPath, SAMPLE_CSV);

    let sendCalls = 0;
    const sendDeps: SendExpectEmailDeps = {
      fromEmail: "test@example.com",
      apiKeyPresent: true,
      send: async () => {
        sendCalls += 1;
        return { error: null };
      },
    };

    const logs: string[] = [];
    const result = await runExpectEmailCli({
      csvPath,
      outDir,
      dryRun: true,
      send: true,
      sendDeps,
      log: (message) => logs.push(message),
    });

    expect(result.guests).toHaveLength(2);
    expect(result.dryRunListed).toEqual(["alex@example.com", "sam@example.com"]);
    expect(result.sent).toEqual([]);
    expect(sendCalls).toBe(0);
    expect(logs.some((line) => line.includes("[dry-run]"))).toBe(true);

    await rm(tmpRoot, { recursive: true, force: true });
  });

  test("without --send, send deps are unused", async () => {
    const tmpRoot = join(import.meta.dir, "../../.tmp-expect-email-test-nosend");
    const csvPath = join(tmpRoot, "guests.csv");
    const outDir = join(tmpRoot, "out");
    await mkdir(tmpRoot, { recursive: true });
    await Bun.write(csvPath, SAMPLE_CSV);

    let sendCalls = 0;
    const result = await runExpectEmailCli({
      csvPath,
      outDir,
      dryRun: false,
      send: false,
      limit: 1,
      sendDeps: {
        fromEmail: "test@example.com",
        apiKeyPresent: true,
        send: async () => {
          sendCalls += 1;
          return { error: null };
        },
      },
      log: () => {},
    });

    expect(result.guests).toHaveLength(1);
    expect(result.written).toHaveLength(1);
    expect(result.sent).toEqual([]);
    expect(sendCalls).toBe(0);

    await rm(tmpRoot, { recursive: true, force: true });
  });
});
