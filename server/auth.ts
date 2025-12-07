// server/auth.ts
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { MANAGER_PASSWORD = "changeme", SESSION_SECRET = "dev-session-secret", DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL not set — sessions will not persist unless set.");
}

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

// session store
const PgSession = connectPgSimple(session as any);
const sessionStore = pool ? new PgSession({ pool }) : undefined;

export const sessionMiddleware = session({
  store: sessionStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // Replit dev uses http; set true if using https & production
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
});

// auth router
export const authRouter = express.Router();

authRouter.post("/login", express.json(), (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "Missing password" });
  if (password !== MANAGER_PASSWORD) return res.status(401).json({ error: "Invalid password" });

  // set session
  (req as any).session.user = { role: "manager" };
  return res.json({ ok: true });
});

authRouter.post("/logout", (req, res) => {
  req.session?.destroy?.(() => {
    res.json({ ok: true });
  });
});

export function requireManager(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).session?.user;
  if (user?.role === "manager") return next();
  return res.status(401).json({ error: "Unauthorized" });
}