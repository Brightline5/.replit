import { defineConfig } from "drizzle-kit";

// Check for DATABASE_URL and NODE_ENV
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing! Please configure your database connection string in a .env file for development. " +
      "E.g., DATABASE_URL=postgres://user:password@host:port/dbname"
  );
}

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", // Update path based on your repo structure if needed
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, // The database connection string
  },
});
