import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { spotsRoutes } from "./routes/spots.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  },
});

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

await app.register(sensible);
await app.register(spotsRoutes, { prefix: "/api/v1" });

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
