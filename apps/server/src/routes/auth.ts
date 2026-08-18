import { db, users } from "@Productlytics/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import express, { Router } from "express";
import { z } from "zod";

import { requireAuth, SESSION_COOKIE, signSession } from "../lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router() as express.Router;

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Same message for unknown email and wrong password — no user enumeration.
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signSession({ userId: user.id, orgId: user.orgId });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ id: user.id, email: user.email, orgId: user.orgId });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.userId),
  });
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ id: user.id, email: user.email, orgId: user.orgId });
});
