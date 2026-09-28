import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, Response } from "express";

import { app } from "../src/app.js";
import { env } from "../src/config/env.js";
import { runMigrations } from "../src/db/migrate.js";

let migrationPromise: Promise<void> | undefined;

export default async function handler(request: IncomingMessage, response: ServerResponse) {
	try {
		if (env.autoMigrate) {
			migrationPromise ??= runMigrations();
			await migrationPromise;
		}
		app(request as Request, response as Response);
	} catch (error) {
		migrationPromise = undefined;
		console.error("Unable to initialize database", error);
		response.statusCode = 500;
		response.setHeader("Content-Type", "application/json; charset=utf-8");
		response.end(JSON.stringify({ message: "Database initialization failed" }));
	}
}

