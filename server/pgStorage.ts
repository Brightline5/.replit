import { randomUUID } from "crypto";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, sql } from "drizzle-orm";
import {
  staff as staffTable,
  shifts as shiftsTable,
  demandForecasts as demandForecastsTable,
  scheduleTemplates as scheduleTemplatesTable,
  aiRecommendations as aiRecommendationsTable,
} from "../shared/schema";

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

import type { IStorage } from "./storage";

export class PgStorage implements IStorage {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });
    this.db = drizzle(this.pool);
  }

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
    } as any);

    const created = await this.getStaffById(id);
    if (!created) throw new Error("Failed to create staff");
    return created;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    await this.db.update(staffTable).set(updates as any).where(eq(staffTable.id, id));
    return this.getStaffById(id);
  }

  async deleteStaff(id: string): Promise<boolean> {
    await this.db.update(staffTable).set({ isActive: false }).where(eq(staffTable.id, id));
    return true;
  }

  async getShifts(filters?: { date?: string; staffId?: string }): Promise<Shift[]> {
    let query = this.db.select().from(shiftsTable).$dynamic();
    if (filters?.date) query = query.where(eq(shiftsTable.date, filters.date));
    if (filters?.staffId) query = query.where(eq(shiftsTable.staffId, filters.staffId));
    const rows = await query;
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
    } as any);

    const created = await this.getShiftById(id);
    if (!created) throw new Error("Failed to create shift");
    return created;
  }

  async updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined> {
    await this.db.update(shiftsTable).set(updates as any).where(eq(shiftsTable.id, id));
    return this.getShiftById(id);
  }

  async deleteShift(id: string): Promise<boolean> {
    await this.db.delete(shiftsTable).where(eq(shiftsTable.id, id));
    return true;
  }

  async getDemandForecasts(dateRange?: { start: string; end: string }): Promise<DemandForecast[]> {
    let query = this.db.select().from(demandForecastsTable).$dynamic();
    if (dateRange) {
      query = query.where(sql`${demandForecastsTable.date} >= ${dateRange.start} AND ${demandForecastsTable.date} <= ${dateRange.end}`);
    }
    const rows = await query;
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
    } as any);
    const rows = await this.db.select().from(demandForecastsTable).where(eq(demandForecastsTable.id, id));
    return rows[0] as DemandForecast;
  }

  async updateActualDemand(id: string, actualDemand: number): Promise<DemandForecast | undefined> {
    await this.db.update(demandForecastsTable).set({ actualDemand }).where(eq(demandForecastsTable.id, id));
    const rows = await this.db.select().from(demandForecastsTable).where(eq(demandForecastsTable.id, id));
    return rows[0] as DemandForecast | undefined;
  }

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
    } as any);
    const rows = await this.db.select().from(scheduleTemplatesTable).where(eq(scheduleTemplatesTable.id, id));
    return rows[0] as ScheduleTemplate;
  }

  async getAiRecommendations(filters?: { isRead?: boolean }): Promise<AiRecommendation[]> {
    let query = this.db.select().from(aiRecommendationsTable).$dynamic();
    if (filters?.isRead !== undefined) query = query.where(eq(aiRecommendationsTable.isRead, filters.isRead));
    const rows = await query;
    return (rows as unknown as AiRecommendation[]).sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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
    } as any);
    const rows = await this.db.select().from(aiRecommendationsTable).where(eq(aiRecommendationsTable.id, id));
    return rows[0] as AiRecommendation;
  }

  async markRecommendationAsRead(id: string): Promise<AiRecommendation | undefined> {
    await this.db.update(aiRecommendationsTable).set({ isRead: true }).where(eq(aiRecommendationsTable.id, id));
    const rows = await this.db.select().from(aiRecommendationsTable).where(eq(aiRecommendationsTable.id, id));
    return (rows[0] as AiRecommendation) || undefined;
  }
}

export default PgStorage;
