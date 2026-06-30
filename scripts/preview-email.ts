import { renderCursorCreditsEmailHtml } from "../src/email-template";

const heroPath = `${import.meta.dir}/../assets/email/cursor-credits-hero.png`;
const heroBase64 = Buffer.from(await Bun.file(heroPath).arrayBuffer()).toString("base64");

const html = renderCursorCreditsEmailHtml({ name: "Alex" }).replace(
  'src="cid:cursor-credits-hero"',
  `src="data:image/png;base64,${heroBase64}"`,
);

const outPath = `${import.meta.dir}/../preview/email-demo.html`;
await Bun.write(outPath, html);
console.log(`Preview written to ${outPath}`);
