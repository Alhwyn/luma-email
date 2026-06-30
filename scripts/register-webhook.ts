import { Luma, webhookEventTypesFromEnv } from "@alhwyn/luma";

const luma = new Luma(process.env.LUMA_API_KEY!);
const webhookUrl = process.env.WEBHOOK_URL;

if (!process.env.LUMA_API_KEY) {
  throw new Error("Set LUMA_API_KEY before registering a webhook");
}

if (!webhookUrl) {
  throw new Error("Set WEBHOOK_URL to your public /webhooks/luma endpoint");
}

const endpoint = await luma.webhooks.create({
  url: webhookUrl,
  event_types: webhookEventTypesFromEnv(),
});

console.log("Webhook registered:");
console.log("  ID:", endpoint.api_id);
console.log("  URL:", endpoint.url);
console.log("  Events:", endpoint.event_types.join(", "));
console.log("\nSave this secret as LUMA_WEBHOOK_SECRET:");
console.log(endpoint.secret);
