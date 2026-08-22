# Passport guest map

`passports-by-email.json` maps **lowercase email → passport fields** used when sending the Codechella check-in email.

Live source of truth is UUID-keyed:

`https://passport.cursorvictoria.com/passports.json`

## Sync before the event

```bash
bun run sync-passports
```

This fetches the live JSON, keeps only guests with an `email`, and rewrites `passports-by-email.json` (no real guest file is committed by default — only the fake sample entries).

Do **not** commit real guest PII unless you intend to. Prefer syncing on the deploy host / CI secret store, or run the sync locally and keep the output out of git.
