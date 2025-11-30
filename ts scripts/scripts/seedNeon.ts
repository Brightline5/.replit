// scripts/seedNeon.ts
import dotenv from "dotenv";
dotenv.config();

import { createPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "crypto";
import { z } from "zod"; // For seed data validation

import {
  staff as staffTable,
  demandForecasts as demandForecastsTable,
  aiRecommendations as aiRecommendationsTable,
  shifts as shiftsTable,
} from "../shared/schema";

// Zod schemas for validation
const StaffValidator = z.object({
  id: z.string().uuid(),
  name: z.string(),
  position: z.string(),
  hourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid decimal with 2 places"),
  email: z.string().email(),
  phone: z.string(),
  availability: z.record(
    z.string(),
    z.array(
      z.object({
        start: z.string(),
        end: z.string(),
        available: z.boolean(),
      }),
    ),
  ),
  skills: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
});

const DemandForecastValidator = z.object({
  id: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  timeSlot: z.string(),
  predictedDemand: z.number().int(),
  actualDemand: z.number().int().nullable(),
  staffingRecommendation: z.number().int(),
  confidence: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid decimal with 2 places"),
  createdAt: z.date(),
});

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Please configure it in your .env file."
    );
    process.exit(1);
  }

  const pool = createPool(DATABASE_URL);
  const db = drizzle(pool as any);

  try {
    // Clean up before seeding (optional in production)
    console.log("Seeding demo data...");

    // Insert staff members
    const staffMembers = [
      {
        id: randomUUID(),
        name: "Sarah Johnson",
        position: "Head Server",
        hourlyRate: "18.50",
        email: "sarah.j@restaurant.com",
        phone: "(555) 123-4567",
        availability: {
          monday: [{ start: "09:00", end: "17:00", available: true }],
          tuesday: [{ start: "09:00", end: "17:00", available: true }],
          wednesday: [{ start: "09:00", end: "17:00", available: true }],
          thursday: [{ start: "09:00", end: "17:00", available: true }],
          friday: [{ start: "09:00", end: "17:00", available: true }],
          saturday: [{ start: "10:00", end: "18:00", available: true }],
          sunday: [{ start: "10:00", end: "16:00", available: false }],
        },
        skills: ["customer_service", "pos_system", "wine_knowledge"],
        isActive: true,
        createdAt: new Date(),
      },
      // Additional staff members...
    ];

    for (const staff of staffMembers) {
      const validatedStaff = StaffValidator.parse(staff); // Validate input
      await db.insert(staffTable).values(validatedStaff).run();
    }

    // Insert demand forecasts
    const today = new Date();
    const timeSlots = ["morning", "afternoon", "evening"];
    const demandData = [
      [65, 85, 45],
      [45, 65, 35],
      // Additional data...
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      for (let slot = 0; slot < timeSlots.length; slot++) {
        const demand = {
          id: randomUUID(),
          date: dateStr,
          timeSlot: timeSlots[slot],
          predictedDemand: demandData[i][slot],
          actualDemand: i < 3 ? Math.floor(demandData[i][slot] * (0.9 + Math.random() * 0.2)) : null,
          staffingRecommendation: Math.ceil(demandData[i][slot] / 15),
          confidence: "85.5",
          createdAt: new Date(),
        };
        const validatedDemand = DemandForecastValidator.parse(demand); // Validate input
        await db.insert(demandForecastsTable).values(validatedDemand).run();
      }
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});