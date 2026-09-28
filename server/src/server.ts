import { app } from "./app.js";
import { pool } from "./config/database.js";
import { env, requireRuntimeEnv } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";

const start = async () => {
  requireRuntimeEnv();
  if (env.autoMigrate) await runMigrations();
  else await pool.query("SELECT 1");

  const server = app.listen(env.port, () => {
    console.log(`Expense Tracker API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, closing server`);
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch(async (error: unknown) => {
  console.error("Unable to start API", error);
  await pool.end();
  process.exit(1);
});
