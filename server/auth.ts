import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { MANAGER_PASSWORD = "changeme", DATABASE_URL } = process.env;
const isProduction = process.env.NODE_ENV === "production";

if (!DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL not set — sessions will not persist unless set.");
}

const pool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL }) : null;

const PgSession = connectPgSimple(session);
const sessionStore = pool ? new PgSession({ pool: pool as any }) : undefined;

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

export const sessionMiddleware = session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 8,
  },
});

export const authRouter = express.Router();

authRouter.post("/login", express.json(), (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "Missing password" });
  if (password !== MANAGER_PASSWORD) return res.status(401).json({ error: "Invalid password" });

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
