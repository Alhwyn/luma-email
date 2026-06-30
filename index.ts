import { env } from "./src/env";
import { handleLumaEvent } from "./src/handle-event";
import { getWebhookClient } from "./src/luma-webhook";

Bun.serve({
  port: env.port,
  routes: {
    "/health": {
      GET: () => Response.json({ ok: true }),
    },
    "/webhooks/luma": {
      POST: async (req) => {
        try {
          const body = await req.text();
          const event = (await getWebhookClient()).verify({
            body,
            headers: req.headers,
          });

          await handleLumaEvent(event);

          return Response.json({ received: true, type: event.type });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Webhook handling failed";
          console.error(message);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

