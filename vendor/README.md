# Vendored packages

## `@alhwyn/luma` (`vendor/alhwyn-luma`)

Pinned copy of [Alhwyn/luma](https://github.com/Alhwyn/luma) so Vercel’s Bun framework typecheck can resolve the module.

Upstream `github:Alhwyn/luma` only ships `src/` (no built `dist/`), while its published `package.json` points `types` / `import` at `./dist/*`. That breaks Vercel with:

```text
Could not resolve '@alhwyn/luma'
Cannot find module '@alhwyn/luma'
```

This vendor package points `main` / `types` / `exports` at `./src/index.ts`.

To refresh from upstream:

```bash
bun pm cache rm
# re-clone or copy src from a fresh github:Alhwyn/luma install into vendor/alhwyn-luma/src
# keep this package.json exports pointing at src
```
