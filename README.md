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

## Victoria “what to expect” email

Personalized pre-event briefing for approved Cursor Codechella / Cursor Victoria guests. This path is **CLI-only** and does not change check-in webhook behavior (credits email still sends on `guest.updated` check-in).

### Preview with the sample fixture

```bash
bun run expect-email -- fixtures/guests.sample.csv
```

Writes one HTML file per approved guest to `out/expect-email/<guest_id>.html` (gitignored). Open those files locally, or run `bun run dev` and inspect `cursor-victoria-expect-email` in the React Email preview at `http://localhost:3001`.

### Point at a local Luma CSV

```bash
bun run expect-email -- /path/to/your-guests.csv --dry-run --limit 5
```

- Only `approval_status=approved` rows are included by default.
- Survey columns like `Where are you based?` and `Are you traveling to Victoria, BC Canada for this?` are mapped automatically.
- Optional avatar URL columns: `x_avatar_path`, `linkedin_avatar_path`, `avatar_url` (http(s) only; missing avatars fall back to an initial circle).
- Edit placeholders in `src/event-config.ts` (event name, venue, date, Luma URL) before sending.

### Dry-run vs send

| Flag | Behavior |
| --- | --- |
| (default) | Render HTML previews only. Never sends. |
| `--dry-run` | Print who would be emailed. Never sends (even with `--send`). |
| `--send` | Send via Resend. Requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. |
| `--limit N` | Cap how many approved guests to process. |

Do not blast-send to real guests from a PR. Preview and `--dry-run` first. Never commit real guest CSVs, `data/`, `out/`, or scraped avatar dumps.

### Tests

```bash
bun test
```

## Migration notes

### `guest.registered` removed

Earlier versions sent a registration confirmation on `guest.registered`. This worker now only sends the credits email on `guest.updated` when a guest checks in (`event_tickets[].checked_in_at` is set). If you still have `guest.registered` in `LUMA_WEBHOOK_EVENT_TYPES`, you can remove it from your Luma webhook and `.env` — the handler ignores it.

## Docs

- [Unofficial Luma SDK](https://alhwyn.mintlify.site/introduction)
- [Verify incoming webhooks](https://alhwyn.mintlify.site/webhooks/verify)
- [Resend API](https://resend.com/docs)
