import { pool } from "../config/database.js";
import { requireRuntimeEnv } from "../config/env.js";
import { runMigrations } from "../db/migrate.js";

try {
  requireRuntimeEnv();
  await runMigrations();
  console.log("Database migration completed");
} catch (error) {
  console.error("Database migration failed", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
