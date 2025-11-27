// server/pgStorage.ts
import { randomUUID } from "crypto";
import { createPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import {
  staff as staffTable,
  shifts as shiftsTable,
  demandForecasts as demandForecastsTable,
  scheduleTemplates as scheduleTemplatesTable,
  aiRecommendations as aiRecommendationsTable,
} from "../shared/schema"; // adjust path if your shared schema path is different

// import types (adjust path if your types live elsewhere)
import type {
  Staff,
  InsertStaff,
  Shift,
  InsertShift,
  DemandForecast,
  InsertDemandForecast,
  ScheduleTemplate,
  InsertScheduleTemplate,
  AiRecommendation,
  InsertAiRecommendation,
} from "../shared/schema";

import type { IStorage } from "./storage"; // adjust path if IStorage interface lives elsewhere

export class PgStorage implements IStorage {
  private pool: ReturnType<typeof createPool>;
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    this.pool = createPool(databaseUrl);
    this.db = drizzle(this.pool as any);
  }

  // STAFF
  async getStaff(): Promise<Staff[]> {
    const rows = await this.db.select().from(staffTable).where(eq(staffTable.isActive, true));
    return rows as unknown as Staff[];
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    const rows = await this.db.select().from(staffTable).where(eq(staffTable.id, id));
    return (rows[0] as unknown as Staff) || undefined;
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const now = new Date();
    await this.db.insert(staffTable).values({
      id,
      name: insertStaff.name,
      position: insertStaff.position,
      hourlyRate: insertStaff.hourlyRate,
      email: insertStaff.email ?? null,
      phone: insertStaff.phone ?? null,
      availability: insertStaff.availability ?? {},
      skills: insertStaff.skills ?? [],
      isActive: insertStaff.isActive ?? true,
      createdAt: now,
    }).run();

    const created = await this.getStaffById(id);
    if (!created) throw new Error("Failed to create staff");
    return created;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    await this.db.update(staffTable).set(updates as any).where(eq(staffTable.id, id)).run();
    return this.getStaffById(id);
  }

  async deleteStaff(id: string): Promise<boolean> {
    await this.db.update(staffTable).set({ isActive: false }).where(eq(staffTable.id, id)).run();
    return true;
  }

  // SHIFTS
  async getShifts(filters?: { date?: string; staffId?: string }): Promise<Shift[]> {
    let q = this.db.select().from(shiftsTable);
    if (filters?.date) q = q.where(eq(shiftsTable.date, filters.date));
    if (filters?.staffId) q = q.where(eq(shiftsTable.staffId, filters.staffId));
    const rows = await q;
    return rows as unknown as Shift[];
  }

  async getShiftById(id: string): Promise<Shift | undefined> {
    const rows = await this.db.select().from(shiftsTable).where(eq(shiftsTable.id, id));
    return (rows[0] as unknown as Shift) || undefined;
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const now = new Date();
    await this.db.insert(shiftsTable).values({
      ...insertShift,
      id,
      createdAt: now,
      status: insertShift.status ?? "scheduled",
      notes: insertShift.notes ?? null,
    } as any).run();

    const created = await this.getShiftById(id);
    if (!created) throw new Error("Failed to create shift");
    return created;
  }

  async updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined> {
    await this.db.update(shiftsTable).set(updates as any).where(eq(shiftsTable.id, id)).run();
    return this.getShiftById(id);
  }

  async deleteShift(id: string): Promise<boolean> {
    await this.db.delete(shiftsTable).where(eq(shiftsTable.id, id)).run();
    return true;
  }

  // DEMAND FORECASTS
  async getDemandForecasts(dateRange?: { start: string; end: string }): Promise<DemandForecast[]> {
    let q = this.db.select().from(demandForecastsTable);
    if (dateRange) {
      // assume date is stored as 'YYYY-MM-DD' string or date-like comparable lexically
      q = q.where(sql`${demandForecastsTable.date} >= ${dateRange.start} AND ${demandForecastsTable.date} <= ${dateRange.end}`);
    }
    const rows = await q;
    return (rows as unknown as DemandForecast[]).sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDemandForecast(forecast: InsertDemandForecast): Promise<DemandForecast> {
    const id = randomUUID();
    const now = new Date();
    await this.db.insert(demandForecastsTable).values({
      ...forecast,
      id,
      createdAt: now,
      actualDemand: forecast.actualDemand ?? null,
    } as any).run();
    const rows = await this.db.select().from(demandForecastsTable).where(eq(demandForecastsTable.id, id));
    return rows[0] as DemandForecast;
  }

  async updateActualDemand(id: string, actualDemand: number): Promise<DemandForecast | undefined> {
    await this.db.update(demandForecastsTable).set({ actualDemand }).where(eq(demandForecastsTable.id, id)).run();
    const rows = await this.db.select().from(demandForecastsTable).where(eq(demandForecastsTable.id, id));
    return rows[0] as DemandForecast | undefined;
  }

  // SCHEDULE TEMPLATES
  async getScheduleTemplates(): Promise<ScheduleTemplate[]> {
    const rows = await this.db.select().from(scheduleTemplatesTable);
    return rows as unknown as ScheduleTemplate[];
  }

  async getDefaultTemplate(): Promise<ScheduleTemplate | undefined> {
    const rows = await this.db.select().from(scheduleTemplatesTable).where(eq(scheduleTemplatesTable.isDefault, true));
    return (rows[0] as unknown as ScheduleTemplate) || undefined;
  }

  async createScheduleTemplate(template: InsertScheduleTemplate): Promise<ScheduleTemplate> {
    const id = randomUUID();
    const now = new Date();
    await this.db.insert(scheduleTemplatesTable).values({
      ...template,
      id,
      createdAt: now,
      description: template.description ?? null,
      isDefault: template.isDefault ?? false,
    } as any).run();
    const rows = await this.db.select().from(scheduleTemplatesTable).where(eq(scheduleTemplatesTable.id, id));
    return rows[0] as ScheduleTemplate;
  }

  // AI Recommendations
  async getAiRecommendations(filters?: { isRead?: boolean }): Promise<AiRecommendation[]> {
    let q = this.db.select().from(aiRecommendationsTable);
    if (filters?.isRead !== undefined) q = q.where(eq(aiRecommendationsTable.isRead, filters.isRead));
    const rows = await q;
    return (rows as unknown as AiRecommendation[]).sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return bT - aT;
    });
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const id = randomUUID();
    const now = new Date();
    await this.db.insert(aiRecommendationsTable).values({
      ...recommendation,
      id,
      isRead: false,
      createdAt: now,
      data: recommendation.data ?? {},
      priority: recommendation.priority ?? "medium",
    } as any).run();
    const rows = await this.db.select().from(aiRecommendationsTable).where(eq(aiRecommendationsTable.id, id));
    return rows[0] as AiRecommendation;
  }

  async markRecommendationAsRead(id: string): Promise<AiRecommendation | undefined> {
    await this.db.update(aiRecommendationsTable).set({ isRead: true }).where(eq(aiRecommendationsTable.id, id)).run();
    const rows = await this.db.select().from(aiRecommendationsTable).where(eq(aiRecommendationsTable.id, id));
    return (rows[0] as AiRecommendation) || undefined;
  }
}

export default PgStorage;