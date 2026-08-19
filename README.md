# luma-email

A simple [Bun](https://bun.com) worker that receives [Luma webhooks](https://alhwyn.mintlify.site/webhooks/verify) via the unofficial [`@alhwyn/luma`](https://alhwyn.mintlify.site/introduction) SDK and sends transactional email with [Resend](https://resend.com).

## What it does

- `POST /webhooks/luma` — verifies signed Luma webhook payloads and sends email
- `guest.updated` (check-in) — sends credits email when a guest is checked in (`event_tickets[].checked_in_at` is set)
- `GET /health` — health check
- `bun run enrich-avatars` — enrich a Luma guests CSV with X / LinkedIn profile photo URLs and local PNG caches

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
| `UNAVATAR_API_KEY` | Optional. [unavatar.io](https://unavatar.io) key for higher rate limits when enriching avatars |

## Run locally

```bash
bun run dev
```

On every `bun run dev`, fetches your Luma calendar events from the API and lets you pick which one to automate. Credits email sends on guest check-in (`guest.updated` with `checked_in_at`) for that event only. Pass `--skip-prompt` to skip.

Starts the webhook worker at `http://localhost:3000` and the [React Email](https://react.email/docs/components/html) preview at `http://localhost:3001`.

## Enrich guest avatars

Offline script that reads a Luma guests export, resolves public profile photos via [unavatar.io](https://unavatar.io) (X + LinkedIn), writes PNGs under `avatars/`, and emits an enriched CSV.

Put real exports under `data/` (gitignored). A fake sample lives at `fixtures/guests.sample.csv`.

```bash
# Dry / small run against the fixture
bun run enrich-avatars -- fixtures/guests.sample.csv --limit 2 --dry-run

# Full run (place your export at data/guests.csv first)
bun run enrich-avatars -- data/guests.csv

# Useful flags
bun run enrich-avatars -- data/guests.csv --limit 20 --delay 750 --out data/guests.enriched.csv
```

### How resolution works

1. Prefer the survey columns `What is your X (Twitter) handle?` and `What is your LinkedIn profile?` (URLs or bare handles).
2. Fetch `https://unavatar.io/x/{handle}?fallback=false` and `https://unavatar.io/linkedin/user:{slug}?fallback=false`.
3. If a handle/URL is missing, record a best-effort search query (`name` + company + city + `site:…`) and mark `avatar_status=not_found` — no login scraping.
4. Failures are skipped per guest; the run continues. Optional `UNAVATAR_API_KEY` reduces rate-limit issues.

### New CSV columns

| Column | Meaning |
| --- | --- |
| `x_handle` | Normalized X username |
| `x_avatar_url` | Public resolver URL |
| `x_avatar_path` | Local PNG path (`avatars/{guest_id}-x.png`) |
| `x_search_query` | Query recorded when no handle was provided |
| `linkedin_url` | Canonical LinkedIn profile URL |
| `linkedin_avatar_url` | Public resolver URL |
| `linkedin_avatar_path` | Local PNG path |
| `linkedin_search_query` | Query recorded when no URL was provided |
| `avatar_source` | `x` \| `linkedin` \| `none` (preferred source) |
| `avatar_status` | `ok` \| `partial` \| `not_found` \| `skipped` |

The credits email template accepts an optional `guestAvatarUrl` prop (shown in React Email preview). Check-in webhook sending is unchanged — pass a URL from the enriched CSV when you wire it up.

```bash
bun test
```

## Register a Luma webhook

Expose your worker publicly (for example with [ngrok](https://ngrok.com)), then:

```bash
WEBHOOK_URL=https://your-domain.com/webhooks/luma bun run register-webhook
```

The worker loads the webhook signing secret from Luma automatically using `LUMA_API_KEY`. Set `WEBHOOK_URL` in `.env` if you have more than one active webhook.

See the [SDK webhook docs](https://alhwyn.mintlify.site/webhooks/create) for details.

## Migration notes

### `guest.registered` removed

Earlier versions sent a registration confirmation on `guest.registered`. This worker now only sends the credits email on `guest.updated` when a guest checks in (`event_tickets[].checked_in_at` is set). If you still have `guest.registered` in `LUMA_WEBHOOK_EVENT_TYPES`, you can remove it from your Luma webhook and `.env` — the handler ignores it.

## Docs

- [Unofficial Luma SDK](https://alhwyn.mintlify.site/introduction)
- [Verify incoming webhooks](https://alhwyn.mintlify.site/webhooks/verify)
- [Resend API](https://resend.com/docs)
- [unavatar.io](https://unavatar.io/docs)
