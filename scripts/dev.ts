import { join } from "node:path";
import { spawn } from "bun";
import * as p from "@clack/prompts";
import { Luma } from "@alhwyn/luma";

const root = join(import.meta.dir, "..");
const emailPort = Number(process.env.EMAIL_PREVIEW_PORT ?? 3001);
const workerPort = Number(process.env.PORT ?? 3000);
const emailCli = join(root, "node_modules/react-email/dist/cli/index.mjs");
const skipPrompt = process.argv.includes("--skip-prompt");

async function writeEnvVar(key: string, value: string): Promise<void> {
  const envPath = join(root, ".env");
  const envFile = Bun.file(envPath);
  const exists = await envFile.exists();
  const line = `${key}=${value}`;

  if (!exists) {
    await Bun.write(envPath, `${line}\n`);
    return;
  }

  const content = await envFile.text();
  const lines = content.split("\n");
  let found = false;
  const updated = lines.map((entry) => {
    if (entry.startsWith(`${key}=`)) {
      found = true;
      return line;
    }
    return entry;
  });

  if (!found) {
    updated.push(line);
  }

  const output = updated.join("\n");
  await Bun.write(envPath, output.endsWith("\n") ? output : `${output}\n`);
}

function requireApiKey(): string {
  const apiKey = process.env.LUMA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing LUMA_API_KEY. Add it to .env — get a key at https://luma.com/calendar/manage/api-keys",
    );
  }
  return apiKey;
}

async function resolveLumaEventId(): Promise<string> {
  const existing = process.env.LUMA_EVENT_ID?.trim();

  if (existing && skipPrompt) {
    p.log.info(`Luma event: ${existing}`);
    return existing;
  }

  const luma = new Luma(requireApiKey());
  const { data: events, hasMore } = await luma.events.list({ pagination_limit: 50 });

  if (events.length === 0) {
    throw new Error("No events found on your Luma calendar.");
  }

  if (hasMore) {
    p.log.warn(`Showing ${events.length} events (more available on Luma).`);
  }

  const initialValue = existing ?? events[0]?.id;

  p.intro("luma-email dev");

  const selected = await p.select({
    message: "Which Luma event should email automation run for?",
    options: events.map((event) => ({
      value: event.id,
      label: event.name,
    })),
    initialValue,
  });

  if (p.isCancel(selected)) {
    p.cancel("Dev startup cancelled.");
    process.exit(0);
  }

  const eventId = selected as string;
  const eventName = events.find((event) => event.id === eventId)?.name ?? eventId;

  const confirmed = await p.confirm({
    message: `Set up email automation for "${eventName}"?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Dev startup cancelled.");
    process.exit(0);
  }

  process.env.LUMA_EVENT_ID = eventId;
  await writeEnvVar("LUMA_EVENT_ID", eventId);
  p.outro(`Event: ${eventName}`);

  return eventId;
}

const lumaEventId = await resolveLumaEventId();
const devEnv = { ...process.env, LUMA_EVENT_ID: lumaEventId };

const children = [
  spawn(["bun", "--hot", "index.ts"], {
    cwd: root,
    env: devEnv,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
  spawn(["bun", emailCli, "dev", "--dir", "src/emails", "--port", String(emailPort)], {
    cwd: root,
    env: devEnv,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
];

let shuttingDown = false;

function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

const childNames = ["worker", "email preview"] as const;

for (const [index, child] of children.entries()) {
  void child.exited.then((code) => {
    if (shuttingDown) return;
    console.error(`${childNames[index]} exited unexpectedly (code ${code})`);
    shutdown();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`Worker: http://localhost:${workerPort}`);
console.log(`Email preview: http://localhost:${emailPort}`);

await new Promise<void>(() => {});
