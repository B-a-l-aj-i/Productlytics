import { env } from "@Productlytics/env/server";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "session";

export type SessionUser = { userId: number; orgId: number };

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string") return null;
    return { userId: payload.userId, orgId: payload.orgId };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.[SESSION_COOKIE];
  const user = token ? verifySession(token) : null;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.user = user;
  next();
}
