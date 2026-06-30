# luma-email

A simple [Bun](https://bun.com) worker that receives [Luma webhooks](https://alhwyn.mintlify.site/webhooks/verify) via the unofficial [`@alhwyn/luma`](https://alhwyn.mintlify.site/introduction) SDK and sends transactional email with [Resend](https://resend.com).

## What it does

- `POST /webhooks/luma` — verifies signed Luma webhook payloads and sends email
- `guest.registered` — sends a registration confirmation email
- `guest.updated` (check-in) — sends a welcome email when a guest is checked in
- `GET /health` — health check

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
| `LUMA_WEBHOOK_SECRET` | From webhook registration (see below) |
| `LUMA_WEBHOOK_EVENT_TYPES` | Comma-separated events, e.g. `guest.updated,guest.registered` |
| `RESEND_API_KEY` | From [Resend](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `WEBHOOK_URL` | Public URL for `/webhooks/luma` (for registration script) |
| `PORT` | Server port (default `3000`) |

## Run locally

```bash
bun run dev
```

Starts the webhook worker at `http://localhost:3000` and the [React Email](https://react.email/docs/components/html) preview at `http://localhost:3001`.

## Register a Luma webhook

Expose your worker publicly (for example with [ngrok](https://ngrok.com)), then:

```bash
WEBHOOK_URL=https://your-domain.com/webhooks/luma bun run register-webhook
```

Save the printed `secret` as `LUMA_WEBHOOK_SECRET` in `.env`.

See the [SDK webhook docs](https://alhwyn.mintlify.site/webhooks/create) for details.

## Docs

- [Unofficial Luma SDK](https://alhwyn.mintlify.site/introduction)
- [Verify incoming webhooks](https://alhwyn.mintlify.site/webhooks/verify)
- [Resend API](https://resend.com/docs)
