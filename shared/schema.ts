import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const staff = pgTable("staff", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(), // Server, Cook, Manager, etc.
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  availability: json("availability")
    .$type<{
      [key: string]: { start: string; end: string; available: boolean }[];
    }>()
    .default({}),
  skills: json("skills").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id")
    .references(() => staff.id)
    .notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  position: text("position").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const demandForecasts = pgTable("demand_forecasts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(), // morning, afternoon, evening
  predictedDemand: integer("predicted_demand").notNull(),
  actualDemand: integer("actual_demand"),
  staffingRecommendation: integer("staffing_recommendation").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scheduleTemplates = pgTable("schedule_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  template: json("template")
    .$type<{
      [key: string]: {
        morning: { position: string; count: number }[];
        afternoon: { position: string; count: number }[];
        evening: { position: string; count: number }[];
      };
    }>()
    .notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // optimization, cost_reduction, training, alert
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  isRead: boolean("is_read").default(false),
  data: json("data").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

export const insertDemandForecastSchema = createInsertSchema(
  demandForecasts,
).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleTemplateSchema = createInsertSchema(
  scheduleTemplates,
).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(
  aiRecommendations,
).omit({
  id: true,
  createdAt: true,
});

// Types
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type DemandForecast = typeof demandForecasts.$inferSelect;
export type InsertDemandForecast = z.infer<typeof insertDemandForecastSchema>;
export type ScheduleTemplate = typeof scheduleTemplates.$inferSelect;
export type InsertScheduleTemplate = z.infer<
  typeof insertScheduleTemplateSchema
>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<
  typeof insertAiRecommendationSchema
>;
