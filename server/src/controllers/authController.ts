import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

import { pool } from "../config/database.js";
import { env } from "../config/env.js";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (user: Pick<UserRow, "id" | "email">) =>
  jwt.sign({ email: user.email }, env.jwtSecret!, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });

const publicUser = (user: UserRow) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  token: createToken(user),
});

export const register = async (request: Request, response: Response) => {
  const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body?.email === "string"
    ? request.body.email.trim().toLowerCase()
    : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";

  if (name.length < 2 || name.length > 100) {
    response.status(400).json({ message: "Name must be between 2 and 100 characters" });
    return;
  }
  if (!emailPattern.test(email)) {
    response.status(400).json({ message: "Enter a valid email address" });
    return;
  }
  if (password.length < 8 || password.length > 72) {
    response.status(400).json({ message: "Password must be between 8 and 72 characters" });
    return;
  }

  const existing = await pool.query("SELECT 1 FROM expense_users WHERE email = $1", [email]);
  if (existing.rowCount) {
    response.status(409).json({ message: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query<UserRow>(
    `INSERT INTO expense_users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, password_hash`,
    [name, email, passwordHash],
  );
  response.status(201).json(publicUser(result.rows[0]!));
};

export const login = async (request: Request, response: Response) => {
  const email = typeof request.body?.email === "string"
    ? request.body.email.trim().toLowerCase()
    : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required" });
    return;
  }

  const result = await pool.query<UserRow>(
    "SELECT id, name, email, password_hash FROM expense_users WHERE email = $1",
    [email],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    response.status(401).json({ message: "Invalid email or password" });
    return;
  }
  response.json(publicUser(user));
};

export const me = async (request: Request, response: Response) => {
  const result = await pool.query<Pick<UserRow, "id" | "name" | "email">>(
    "SELECT id, name, email FROM expense_users WHERE id = $1",
    [request.user!.id],
  );
  if (!result.rows[0]) {
    response.status(404).json({ message: "User not found" });
    return;
  }
  response.json(result.rows[0]);
};
