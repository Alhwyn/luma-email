import { join } from "node:path";
import { spawn } from "bun";

const root = join(import.meta.dir, "..");
const emailPort = Number(process.env.EMAIL_PREVIEW_PORT ?? 3001);
const workerPort = Number(process.env.PORT ?? 3000);
const emailCli = join(root, "node_modules/react-email/dist/cli/index.mjs");

const children = [
  spawn(["bun", "--hot", "index.ts"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
  spawn(["bun", emailCli, "dev", "--dir", "src/emails", "--port", String(emailPort)], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
];

let shuttingDown = false;

function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

const childNames = ["worker", "email preview"] as const;

for (const [index, child] of children.entries()) {
  void child.exited.then((code) => {
    if (shuttingDown) return;
    console.error(`${childNames[index]} exited unexpectedly (code ${code})`);
    shutdown();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`Worker: http://localhost:${workerPort}`);
console.log(`Email preview: http://localhost:${emailPort}`);

await new Promise<void>(() => {});
