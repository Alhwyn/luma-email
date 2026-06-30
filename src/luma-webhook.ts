import type { Webhook } from "@alhwyn/luma";
import { Luma, WebhookInboundClient, WebhookSignatureError } from "@alhwyn/luma";
import { env } from "./env";

const WEBHOOK_SECRET_TTL_MS = 5 * 60 * 1000;

type CachedWebhookClient = {
  client: WebhookInboundClient;
  fetchedAt: number;
};

let cached: CachedWebhookClient | undefined;

async function listAllWebhooks(luma: Luma): Promise<Webhook[]> {
  const webhooks: Webhook[] = [];
  let cursor: string | undefined;

  do {
    const page = await luma.webhooks.list({
      pagination_limit: 50,
      ...(cursor ? { pagination_cursor: cursor } : {}),
    });
    webhooks.push(...page.data);
    cursor = page.hasMore ? (page.nextCursor ?? undefined) : undefined;
  } while (cursor);

  return webhooks;
}

async function resolveWebhookSecret(luma: Luma): Promise<string> {
  const webhookUrl = process.env.WEBHOOK_URL?.trim();
  const webhooks = await listAllWebhooks(luma);

  if (webhooks.length === 0) {
    throw new Error(
      "No Luma webhooks registered. Run: WEBHOOK_URL=https://your-url/webhooks/luma bun run register-webhook",
    );
  }

  if (webhookUrl) {
    const match = webhooks.find((webhook) => webhook.url === webhookUrl);
    if (!match) {
      throw new Error(`No Luma webhook registered for WEBHOOK_URL: ${webhookUrl}`);
    }
    return match.secret;
  }

  const active = webhooks.filter((webhook) => webhook.status === "active");
  if (active.length === 1) {
    return active[0].secret;
  }

  throw new Error(
    active.length === 0
      ? "No active Luma webhooks found."
      : "Multiple active Luma webhooks — set WEBHOOK_URL in .env to select one.",
  );
}

function isCacheFresh(entry: CachedWebhookClient): boolean {
  return Date.now() - entry.fetchedAt < WEBHOOK_SECRET_TTL_MS;
}

export function invalidateWebhookClient(): void {
  cached = undefined;
}

async function buildWebhookClient(): Promise<WebhookInboundClient> {
  const luma = new Luma(env.lumaApiKey());
  const secret = await resolveWebhookSecret(luma);
  return luma.webhooks.client({ secret });
}

export async function getWebhookClient(): Promise<WebhookInboundClient> {
  if (cached && isCacheFresh(cached)) {
    return cached.client;
  }

  const client = await buildWebhookClient();
  cached = { client, fetchedAt: Date.now() };
  return client;
}

export async function verifyWebhook(params: {
  body: string;
  headers: Headers;
}): Promise<ReturnType<WebhookInboundClient["verify"]>> {
  try {
    return (await getWebhookClient()).verify(params);
  } catch (error) {
    if (!(error instanceof WebhookSignatureError)) {
      throw error;
    }

    invalidateWebhookClient();
    return (await getWebhookClient()).verify(params);
  }
}
