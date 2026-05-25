const { Pool } = require("pg");

const useConnectionString = Boolean(process.env.DATABASE_URL);
const requiredEnvVars = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];
const missingEnvVars = useConnectionString
  ? []
  : requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing database environment variable(s): ${missingEnvVars.join(", ")}`
  );
}

const ssl =
  process.env.DB_SSL === "true" ||
  (process.env.NODE_ENV === "production" && process.env.DB_SSL !== "false")
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: String(process.env.DB_PASSWORD),
        port: Number(process.env.DB_PORT),
        ssl,
      }
);

module.exports = pool;
