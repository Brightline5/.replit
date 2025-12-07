// scripts/seedNeon.ts
import dotenv from "dotenv";
dotenv.config();

import { createPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "crypto";
import {
  staff as staffTable,
  demandForecasts as demandForecastsTable,
  aiRecommendations as aiRecommendationsTable,
  shifts as shiftsTable,
} from "../shared/schema";

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const pool = createPool(DATABASE_URL);
  const db = drizzle(pool as any);

  // Clean up (optional) - be careful in prod
  console.log("Seeding demo data...");

  // insert staff
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
    {
      id: randomUUID(),
      name: "Marcus Rodriguez",
      position: "Line Cook",
      hourlyRate: "16.00",
      email: "marcus.r@restaurant.com",
      phone: "(555) 234-5678",
      availability: {
        monday: [{ start: "10:00", end: "18:00", available: true }],
        tuesday: [{ start: "10:00", end: "18:00", available: true }],
        wednesday: [{ start: "10:00", end: "18:00", available: true }],
        thursday: [{ start: "10:00", end: "18:00", available: true }],
        friday: [{ start: "10:00", end: "20:00", available: true }],
        saturday: [{ start: "10:00", end: "20:00", available: true }],
        sunday: [{ start: "12:00", end: "18:00", available: true }],
      },
      skills: ["grill", "prep", "food_safety"],
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      name: "Emma Chen",
      position: "Server",
      hourlyRate: "15.00",
      email: "emma.c@restaurant.com",
      phone: "(555) 345-6789",
      availability: {
        monday: [{ start: "11:00", end: "19:00", available: true }],
        tuesday: [{ start: "11:00", end: "19:00", available: true }],
        wednesday: [{ start: "11:00", end: "19:00", available: true }],
        thursday: [{ start: "11:00", end: "19:00", available: true }],
        friday: [{ start: "11:00", end: "21:00", available: true }],
        saturday: [{ start: "11:00", end: "21:00", available: true }],
        sunday: [{ start: "11:00", end: "19:00", available: true }],
      },
      skills: ["customer_service", "pos_system"],
      isActive: true,
      createdAt: new Date(),
    },
  ];

  for (const s of staffMembers) {
    await db.insert(staffTable).values(s).run();
  }

  // demand forecasts
  const today = new Date();
  const timeSlots = ["morning", "afternoon", "evening"];
  const demandData = [
    [65, 85, 45],
    [45, 65, 35],
    [70, 90, 50],
    [85, 110, 70],
    [120, 150, 100],
    [140, 180, 120],
    [95, 120, 80],
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    for (let slot = 0; slot < timeSlots.length; slot++) {
      await db.insert(demandForecastsTable).values({
        id: randomUUID(),
        date: dateStr,
        timeSlot: timeSlots[slot],
        predictedDemand: demandData[i][slot],
        actualDemand: i < 3 ? Math.floor(demandData[i][slot] * (0.9 + Math.random() * 0.2)) : null,
        staffingRecommendation: Math.ceil(demandData[i][slot] / 15),
        confidence: "85.5",
        createdAt: new Date(),
      }).run();
    }
  }

  // AI recommendations
  const staffRows = await db.select().from(staffTable);
  const emma = staffRows.find((r: any) => r.name === "Emma Chen");

  const recs = [
    {
      id: randomUUID(),
      type: "optimization",
      title: "Schedule Optimization",
      description: "Add 2 more servers for Friday dinner rush to improve service efficiency",
      priority: "high",
      data: { day: "friday", shift: "evening", position: "server", count: 2 },
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      type: "cost_reduction",
      title: "Cost Reduction",
      description: "Reduce kitchen staff by 1 person on Tuesday to save $80 in labor costs",
      priority: "medium",
      data: { day: "tuesday", shift: "afternoon", position: "cook", savings: 80 },
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      type: "training",
      title: "Staff Training",
      description: "Emma Chen shows high performance - consider promotion opportunities",
      priority: "low",
      data: { staffId: emma?.id ?? null },
      isRead: false,
      createdAt: new Date(),
    },
  ];

  for (const r of recs) {
    await db.insert(aiRecommendationsTable).values(r).run();
  }

  // today's shifts (simple)
  const todayStr = today.toISOString().split("T")[0];
  const todayShifts = [
    {
      id: randomUUID(),
      staffId: staffMembers[0].id,
      date: todayStr,
      startTime: "09:00",
      endTime: "17:00",
      position: "Head Server",
      status: "confirmed",
      notes: null,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      staffId: staffMembers[1].id,
      date: todayStr,
      startTime: "10:00",
      endTime: "18:00",
      position: "Line Cook",
      status: "scheduled",
      notes: null,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      staffId: staffMembers[2].id,
      date: todayStr,
      startTime: "11:00",
      endTime: "19:00",
      position: "Server",
      status: "confirmed",
      notes: null,
      createdAt: new Date(),
    },
  ];

  for (const s of todayShifts) {
    await db.insert(shiftsTable).values(s).run();
  }

  console.log("Seed complete.");
  await (pool as any)?.end?.();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});