import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { pool } from "../config/database.js";
import { env } from "../config/env.js";

type AuthPayload = JwtPayload & { sub: string; email: string };

export const requireAuth = async (request: Request, response: Response, next: NextFunction) => {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret!) as AuthPayload;
    if (!payload.sub || !payload.email) throw new Error("Invalid token payload");
    request.user = { id: payload.sub, email: payload.email };
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  const result = await pool.query<{ is_active: boolean }>(
    "SELECT is_active FROM expense_users WHERE id = $1",
    [request.user!.id],
  );
  if (!result.rows[0]) {
    response.status(401).json({ message: "Account no longer exists" });
    return;
  }
  if (!result.rows[0].is_active) {
    response.status(403).json({ message: "Account is temporarily deactivated" });
    return;
  }
  next();
};
