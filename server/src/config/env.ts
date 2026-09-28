import "dotenv/config";

const getBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true";
};

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid port number");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  databaseUrl: process.env.DATABASE_URL,
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbName: process.env.DB_NAME ?? "expense_tracker",
  dbUser: process.env.DB_USER ?? "postgres",
  dbPassword: process.env.DB_PASSWORD,
  dbSsl: getBoolean(process.env.DB_SSL, process.env.NODE_ENV === "production"),
  dbSslRejectUnauthorized: getBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrls: (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  autoMigrate: getBoolean(process.env.DB_AUTO_MIGRATE, true),
};

export const requireRuntimeEnv = () => {
  if (!env.jwtSecret || env.jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must contain at least 16 characters");
  }
  if (!env.databaseUrl && !env.dbPassword) {
    throw new Error("Set DATABASE_URL or DB_PASSWORD for PostgreSQL");
  }
};
