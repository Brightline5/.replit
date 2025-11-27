import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
// server/index.ts (snippet - integrate into your actual file)
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { sessionMiddleware, authRouter, requireManager } from "./auth";
import PgStorage from "./pgStorage";
import { MemStorage } from "./storage"; // your original in-memory storage
// import or export storage where your handlers use it

const app = express();
app.use(express.json());

// session first so auth routes + API can read session
app.use(sessionMiddleware);
app.use("/auth", authRouter);

// initialize storage
let storage;
if (process.env.DATABASE_URL) {
  storage = new PgStorage(process.env.DATABASE_URL);
  console.log("Using PgStorage (Neon)");
} else {
  storage = new MemStorage();
  console.log("Using MemStorage (in-memory)");
}

// Example: protect write routes
// If your routes are in other modules, ensure they import `storage` from a central file
app.post("/api/shifts", requireManager, async (req, res) => {
  try {
    const shift = await storage.createShift(req.body);
    res.json(shift);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create shift failed" });
  }
});

// mount other routes (staff, forecasts, etc.) — ensure write endpoints use requireManager
// e.g., app.post("/api/staff", requireManager, handler);

// health endpoint
app.get("/healthz", async (req, res) => {
  // check DB connectivity if using PgStorage
  if (process.env.DATABASE_URL) {
    try {
      // small query to confirm connection
      await (storage as any).db?.execute?.(/* no-op */ sql`select 1`); // best-effort
      return res.json({ status: "ok" });
    } catch (err) {
      return res.status(500).json({ status: "db-error", error: String(err) });
    }
  }
  return res.json({ status: "ok" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));