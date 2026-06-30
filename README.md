# luma-email

A simple [Bun](https://bun.com) worker that receives [Luma webhooks](https://alhwyn.mintlify.site/webhooks/verify) via the unofficial [`@alhwyn/luma`](https://alhwyn.mintlify.site/introduction) SDK and sends transactional email with [Resend](https://resend.com).

## What it does

- `POST /webhooks/luma` — verifies signed Luma webhook payloads and sends email
- `guest.updated` (check-in) — sends credits email when a guest is checked in (`event_tickets[].checked_in_at` is set)
- `GET /health` — health check

Which Luma calendar event to automate is configured via `LUMA_EVENT_ID` (set by `bun run dev`). Email sends on `guest.updated` when the guest checks in for that event.

## Setup

### 1. Install dependencies

[`@alhwyn/luma`](https://github.com/Alhwyn/luma) installs from the public GitHub repo — no npm or GitHub token required.

```bash
bun install
```

### 2. Copy environment variables

```bash
cp .env.example .env
```

### 3. Fill in `.env`

| Variable | Description |
| --- | --- |
| `LUMA_API_KEY` | From [Luma API keys](https://luma.com/calendar/manage/api-keys) |
| `LUMA_WEBHOOK_EVENT_TYPES` | Comma-separated events Luma delivers to your webhook, e.g. `guest.updated` |
| `LUMA_EVENT_ID` | Luma calendar event to automate (set by `bun run dev`) |
| `RESEND_API_KEY` | From [Resend](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `WEBHOOK_URL` | Public URL for `/webhooks/luma` (for registration script) |
| `PORT` | Server port (default `3000`) |

## Run locally

```bash
bun run dev
```

On every `bun run dev`, fetches your Luma calendar events from the API and lets you pick which one to automate. Credits email sends on guest check-in (`guest.updated` with `checked_in_at`) for that event only. Pass `--skip-prompt` to skip.

Starts the webhook worker at `http://localhost:3000` and the [React Email](https://react.email/docs/components/html) preview at `http://localhost:3001`.

## Register a Luma webhook

Expose your worker publicly (for example with [ngrok](https://ngrok.com)), then:

```bash
WEBHOOK_URL=https://your-domain.com/webhooks/luma bun run register-webhook
```

The worker loads the webhook signing secret from Luma automatically using `LUMA_API_KEY`. Set `WEBHOOK_URL` in `.env` if you have more than one active webhook.

See the [SDK webhook docs](https://alhwyn.mintlify.site/webhooks/create) for details.

## Docs

- [Unofficial Luma SDK](https://alhwyn.mintlify.site/introduction)
- [Verify incoming webhooks](https://alhwyn.mintlify.site/webhooks/verify)
- [Resend API](https://resend.com/docs)
