import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";

type AuthPayload = JwtPayload & { sub: string; email: string };

export const requireAuth = (request: Request, response: Response, next: NextFunction) => {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret!) as AuthPayload;
    if (!payload.sub || !payload.email) throw new Error("Invalid token payload");
    request.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
};
