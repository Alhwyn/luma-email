# luma-email

A [Bun](https://bun.com) worker that receives [Luma webhooks](https://alhwyn.mintlify.site/webhooks/verify) via the unofficial [`@alhwyn/luma`](https://alhwyn.mintlify.site/introduction) SDK and sends Codechella passport emails with [Resend](https://resend.com). Deployable on [Vercel](https://vercel.com) (Bun runtime).

## What it does

- `POST /webhooks/luma` — verifies signed Luma webhook payloads and sends email
- `guest.updated` (check-in) — when `event_tickets[].checked_in_at` is set for `LUMA_EVENT_ID`, sends the **Codechella passport** email (unique passport link + credits)
- `GET /health` — health check

Production webhook URL shape:

```text
https://<your-vercel-deployment>/webhooks/luma
```

## Check-in email

Subject: `Your Codechella passport`

On check-in the worker looks up `user_email` (lowercase) in `data/passports-by-email.json`. When matched, the email includes:

- Unique passport URL: `https://passport.cursorvictoria.com/{passportId}`
- Unique Cursor redeem link when present on the guest record
- Shared codes: Firecrawl `FIRECRAWL10KCURSOR`, Exa `EXA50CURSOR`, Render `HTHON100-803259`, Wispr Flow, ElevenLabs guide, Convex hackathon

If the email is missing from the map, the worker still sends using the guest’s first name from Luma and a fallback CTA of `https://luma.com/cursorvictoria`.

Sync the map from the live UUID-keyed source before the event:

```bash
bun run sync-passports
```

See `data/README.md`. The committed file only has fake sample entries — do not commit real guest PII unless intentional.

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Copy environment variables

```bash
cp .env.example .env
```

### 3. Fill in `.env` / Vercel env

| Variable | Description |
| --- | --- |
| `LUMA_API_KEY` | From [Luma API keys](https://luma.com/calendar/manage/api-keys). Used to resolve the webhook signing secret via the Luma API (`verifyWebhook`). |
| `LUMA_EVENT_ID` | Luma calendar event id — only check-ins for this event send email |
| `LUMA_WEBHOOK_EVENT_TYPES` | Comma-separated events Luma delivers, e.g. `guest.updated` |
| `RESEND_API_KEY` | From [Resend](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `WEBHOOK_URL` | Full public URL for `/webhooks/luma` (required when multiple Luma webhooks are active, so the correct signing secret is selected) |
| `PORT` | Local server port only (default `3000`) |

There is no separate webhook secret env var: the worker loads the secret from Luma using `LUMA_API_KEY` (and `WEBHOOK_URL` when needed).

## Run locally

```bash
bun run dev
```

On every `bun run dev`, fetches your Luma calendar events and lets you pick which one to automate. Passport email sends on guest check-in for that event only. Pass `--skip-prompt` to skip.

Starts the webhook worker at `http://localhost:3000` and the [React Email](https://react.email/docs/components/html) preview at `http://localhost:3001`.

Or start the HTTP server only:

```bash
bun run start
# equivalent Vercel entrypoint locally:
bun server.ts
```

## Deploy on Vercel

1. Import this repo in Vercel (or `bunx vercel`).
2. Set env vars: `LUMA_API_KEY`, `LUMA_EVENT_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `WEBHOOK_URL=https://<deployment>/webhooks/luma`.
3. Deploy. `vercel.json` sets `"bunVersion": "1.x"` so Vercel runs the Bun framework preset against `server.ts` (`Bun.serve` routes for `/health` and `/webhooks/luma`).
4. Register (or update) the Luma webhook to that production URL:

```bash
WEBHOOK_URL=https://<deployment>/webhooks/luma bun run register-webhook
```

5. Before go-live, run `bun run sync-passports` and redeploy (or bake the map into the deploy) so emails resolve unique passport links.

Confirm health:

```bash
curl https://<deployment>/health
```

## Register a Luma webhook

Expose your worker publicly (Vercel, or locally with [ngrok](https://ngrok.com)), then:

```bash
WEBHOOK_URL=https://your-domain.com/webhooks/luma bun run register-webhook
```

The worker loads the webhook signing secret from Luma automatically using `LUMA_API_KEY`. Set `WEBHOOK_URL` in `.env` / Vercel if you have more than one active webhook.

See the [SDK webhook docs](https://alhwyn.mintlify.site/webhooks/create) for details.

## Migration notes

### Passport email replaces Cursor credits email on check-in

Earlier versions sent a Cursor credits email on `guest.updated` check-in. This worker now sends the Codechella passport email instead. The old React Email template remains under `src/emails/cursor-credits-email.tsx` for reference/preview only.

### `guest.registered` removed

Earlier versions sent a registration confirmation on `guest.registered`. This worker only sends on `guest.updated` when a guest checks in (`event_tickets[].checked_in_at` is set). If you still have `guest.registered` in `LUMA_WEBHOOK_EVENT_TYPES`, you can remove it from your Luma webhook and `.env` — the handler ignores it.

## Docs

- [Unofficial Luma SDK](https://alhwyn.mintlify.site/introduction)
- [Verify incoming webhooks](https://alhwyn.mintlify.site/webhooks/verify)
- [Resend API](https://resend.com/docs)
- [Bun on Vercel](https://vercel.com/docs/functions/runtimes/bun)
