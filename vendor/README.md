# Vendored packages

## `@alhwyn/luma` (`vendor/alhwyn-luma`)

Pinned copy of [Alhwyn/luma](https://github.com/Alhwyn/luma) so Vercel’s Bun framework typecheck can resolve the module.

Upstream `github:Alhwyn/luma` only ships `src/` (no built `dist/`), while its published `package.json` points `types` / `import` at `./dist/*`. That breaks Vercel with:

```text
Could not resolve '@alhwyn/luma'
Cannot find module '@alhwyn/luma'
```

This vendor package points `types` / `bun` at `./src/index.ts` and builds `dist/` on `postinstall` so Node/`import` resolution also works on Vercel.

```bash
bun run --cwd vendor/alhwyn-luma build
```
