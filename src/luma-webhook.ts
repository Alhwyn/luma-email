import { Luma, WebhookInboundClient } from "@alhwyn/luma";
import { env } from "./env";

let cachedClient: WebhookInboundClient | undefined;

async function resolveWebhookSecret(luma: Luma): Promise<string> {
  const webhookUrl = process.env.WEBHOOK_URL?.trim();
  const { data: webhooks } = await luma.webhooks.list({ pagination_limit: 50 });

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

export async function getWebhookClient(): Promise<WebhookInboundClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const luma = new Luma(env.lumaApiKey());
  const secret = await resolveWebhookSecret(luma);
  cachedClient = luma.webhooks.client({ secret });
  return cachedClient;
}
