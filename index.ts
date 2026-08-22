import { env } from "./src/env";
import { startHttpServer } from "./src/http-server";

startHttpServer({ port: env.port });
