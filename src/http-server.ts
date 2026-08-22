export const httpRoutes = {
  "/health": {
    // Keep this path free of Resend / email / Luma SDK imports.
    GET: () => Response.json({ ok: true, service: "luma-email" }),
  },
  "/webhooks/luma": {
    POST: async (req: Request) => {
      try {
        // Lazy-load so /health (and cold starts that only hit health) skip Resend.
        const [{ verifyWebhook }, { handleLumaEvent }] = await Promise.all([
          import("./luma-webhook"),
          import("./handle-event"),
        ]);

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
