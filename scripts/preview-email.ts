import { renderCursorCreditsEmailHtml } from "../src/email-template";

const heroBase64 = Buffer.from(
  await Bun.file(`${import.meta.dir}/../assets/email/cursor-credits-hero.png`).arrayBuffer(),
).toString("base64");

const logoBase64 = Buffer.from(
  await Bun.file(`${import.meta.dir}/../assets/email/cursor-logo.png`).arrayBuffer(),
).toString("base64");

const html = renderCursorCreditsEmailHtml({ name: "Alex" })
  .replace('src="cid:cursor-credits-hero"', `src="data:image/png;base64,${heroBase64}"`)
  .replace('src="cid:cursor-logo"', `src="data:image/png;base64,${logoBase64}"`);

const outPath = `${import.meta.dir}/../preview/email-demo.html`;
await Bun.write(outPath, html);
console.log(`Preview written to ${outPath}`);
