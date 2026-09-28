import pg from "pg";

import { env } from "./env.js";

const ssl = env.dbSsl ? { rejectUnauthorized: env.dbSslRejectUnauthorized } : false;

export const pool = new pg.Pool(
  env.databaseUrl
    ? { connectionString: env.databaseUrl, ssl }
    : {
        host: env.dbHost,
        port: env.dbPort,
        database: env.dbName,
        user: env.dbUser,
        password: env.dbPassword,
        ssl,
      },
);

pool.on("error", (error) => console.error("Unexpected PostgreSQL pool error", error));
