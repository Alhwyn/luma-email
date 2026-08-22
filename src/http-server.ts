import { handleLumaEvent } from "./handle-event";
import { verifyWebhook } from "./luma-webhook";

export const httpRoutes = {
  "/health": {
    GET: () => Response.json({ ok: true }),
  },
  "/webhooks/luma": {
    POST: async (req: Request) => {
      try {
        const body = await req.text();
        const event = await verifyWebhook({
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
} as const;

export function startHttpServer(options?: { port?: number }) {
  return Bun.serve({
    ...(options?.port !== undefined ? { port: options.port } : {}),
    routes: httpRoutes,
    development: {
      hmr: true,
      console: true,
    },
  });
}
