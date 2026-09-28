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
  phone: string | null;
  city: string | null;
  avatar_data: string | null;
  default_currency: string;
  monthly_note: string;
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
  phone: user.phone,
  city: user.city,
  avatarData: user.avatar_data,
  defaultCurrency: user.default_currency,
  monthlyNote: user.monthly_note,
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
     RETURNING id, name, email, password_hash, phone, city, avatar_data,
       default_currency, monthly_note`,
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
    `SELECT id, name, email, password_hash, phone, city, avatar_data,
       default_currency, monthly_note
     FROM expense_users WHERE email = $1`,
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
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, password_hash, phone, city, avatar_data,
       default_currency, monthly_note
     FROM expense_users WHERE id = $1`,
    [request.user!.id],
  );
  if (!result.rows[0]) {
    response.status(404).json({ message: "User not found" });
    return;
  }
  response.json(publicUser(result.rows[0]));
};

export const updateProfile = async (request: Request, response: Response) => {
  const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body?.email === "string"
    ? request.body.email.trim().toLowerCase()
    : "";
  const phone = typeof request.body?.phone === "string" ? request.body.phone.trim() : "";
  const city = typeof request.body?.city === "string" ? request.body.city.trim() : "";
  const avatarData = request.body?.avatarData === null
    ? null
    : typeof request.body?.avatarData === "string" ? request.body.avatarData : null;
  const defaultCurrency = typeof request.body?.defaultCurrency === "string"
    ? request.body.defaultCurrency.trim().toUpperCase()
    : "ZAR";
  const monthlyNote = typeof request.body?.monthlyNote === "string"
    ? request.body.monthlyNote.trim()
    : "";

  if (name.length < 2 || name.length > 100) {
    response.status(400).json({ message: "Name must be between 2 and 100 characters" });
    return;
  }
  if (!emailPattern.test(email)) {
    response.status(400).json({ message: "Enter a valid email address" });
    return;
  }
  if (phone.length > 40 || city.length > 120 || monthlyNote.length > 1000) {
    response.status(400).json({ message: "Profile details exceed the allowed length" });
    return;
  }
  if (!/^[A-Z]{3}$/.test(defaultCurrency)) {
    response.status(400).json({ message: "Currency must be a three-letter code" });
    return;
  }
  if (avatarData && (
    avatarData.length > 700_000 ||
    !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/i.test(avatarData)
  )) {
    response.status(400).json({ message: "Choose a smaller JPEG, PNG, or WebP image" });
    return;
  }

  const result = await pool.query<UserRow>(
    `UPDATE expense_users
     SET name = $2, email = $3, phone = $4, city = $5, avatar_data = $6,
         default_currency = $7, monthly_note = $8, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, password_hash, phone, city, avatar_data,
       default_currency, monthly_note`,
    [request.user!.id, name, email, phone, city, avatarData, defaultCurrency, monthlyNote],
  );
  const user = result.rows[0];
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }
  response.json(publicUser(user));
};
