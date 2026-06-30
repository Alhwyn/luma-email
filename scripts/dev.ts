import { spawn } from "bun";

const emailPort = Number(process.env.EMAIL_PREVIEW_PORT ?? 3001);
const workerPort = Number(process.env.PORT ?? 3000);

const children = [
  spawn(["bun", "--hot", "index.ts"], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
  spawn(["bunx", "email", "dev", "--dir", "src/emails", "--port", String(emailPort)], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
];

function shutdown(): void {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`Worker: http://localhost:${workerPort}`);
console.log(`Email preview: http://localhost:${emailPort}`);

await Promise.race(children.map((child) => child.exited));
shutdown();
