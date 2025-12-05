// server/pgStorage.ts
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
    const result = await this.db.insert(staffTable).values({
      name: insertStaff.name,
      position: insertStaff.position,
      hourlyRate: insertStaff.hourlyRate,
      email: insertStaff.email ?? "",
      phone: insertStaff.phone ?? null,
      availability: insertStaff.availability ?? {},
      skills: insertStaff.skills ?? [],
      isActive: insertStaff.isActive ?? true,
    } as any).returning();

    return result[0] as Staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    await this.db.update(staffTable).set(updates as any).where(eq(staffTable.id, id));
    return this.getStaffById(id);
  }

  async deleteStaff(id: string): Promise<boolean> {
    await this.db.update(staffTable).set({ isActive: false }).where(eq(staffTable.id, id));
    return true;
  }

  // SHIFTS
  async getShifts(filters?: { date?: string; staffId?: string }): Promise<Shift[]> {
    let q = this.db.select().from(shiftsTable);
    if (filters?.date) q = q.where(eq(shiftsTable.date, filters.date)) as any;
    if (filters?.staffId) q = q.where(eq(shiftsTable.staffId, filters.staffId)) as any;
    const rows = await q;
    return rows as unknown as Shift[];
  }

  async getShiftById(id: string): Promise<Shift | undefined> {
    const rows = await this.db.select().from(shiftsTable).where(eq(shiftsTable.id, id));
    return (rows[0] as unknown as Shift) || undefined;
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const result = await this.db.insert(shiftsTable).values({
      staffId: insertShift.staffId,
      date: insertShift.date,
      startTime: insertShift.startTime,
      endTime: insertShift.endTime,
      position: insertShift.position,
      status: insertShift.status ?? "scheduled",
      notes: insertShift.notes ?? null,
    }).returning();

    return result[0] as Shift;
  }

  async updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined> {
    await this.db.update(shiftsTable).set(updates as any).where(eq(shiftsTable.id, id));
    return this.getShiftById(id);
  }

  async deleteShift(id: string): Promise<boolean> {
    await this.db.delete(shiftsTable).where(eq(shiftsTable.id, id));
    return true;
  }

  // DEMAND FORECASTS
  async getDemandForecasts(dateRange?: { start: string; end: string }): Promise<DemandForecast[]> {
    let q = this.db.select().from(demandForecastsTable);
    if (dateRange) {
      q = q.where(sql`${demandForecastsTable.date} >= ${dateRange.start} AND ${demandForecastsTable.date} <= ${dateRange.end}`) as any;
    }
    const rows = await q;
    return (rows as unknown as DemandForecast[]).sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDemandForecast(forecast: InsertDemandForecast): Promise<DemandForecast> {
    const result = await this.db.insert(demandForecastsTable).values({
      date: forecast.date,
      timeSlot: forecast.timeSlot,
      predictedDemand: forecast.predictedDemand,
      actualDemand: forecast.actualDemand ?? null,
      staffingRecommendation: forecast.staffingRecommendation,
      confidence: forecast.confidence,
    }).returning();

    return result[0] as DemandForecast;
  }

  async updateActualDemand(id: string, actualDemand: number): Promise<DemandForecast | undefined> {
    await this.db.update(demandForecastsTable).set({ actualDemand }).where(eq(demandForecastsTable.id, id));
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
    const result = await this.db.insert(scheduleTemplatesTable).values({
      name: template.name,
      description: template.description ?? null,
      template: template.template,
      isDefault: template.isDefault ?? false,
    } as any).returning();

    return result[0] as ScheduleTemplate;
  }

  // AI Recommendations
  async getAiRecommendations(filters?: { isRead?: boolean }): Promise<AiRecommendation[]> {
    let q = this.db.select().from(aiRecommendationsTable);
    if (filters?.isRead !== undefined) q = q.where(eq(aiRecommendationsTable.isRead, filters.isRead)) as any;
    const rows = await q;
    return (rows as unknown as AiRecommendation[]).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const result = await this.db.insert(aiRecommendationsTable).values({
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority ?? "medium",
      isRead: false,
      data: recommendation.data ?? {},
    }).returning();

    return result[0] as AiRecommendation;
  }

  async markRecommendationAsRead(id: string): Promise<AiRecommendation | undefined> {
    await this.db.update(aiRecommendationsTable).set({ isRead: true }).where(eq(aiRecommendationsTable.id, id));
    const rows = await this.db.select().from(aiRecommendationsTable).where(eq(aiRecommendationsTable.id, id));
    return (rows[0] as AiRecommendation) || undefined;
  }
}

export default PgStorage;
