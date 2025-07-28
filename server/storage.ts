import { 
  type Staff, 
  type InsertStaff, 
  type Shift, 
  type InsertShift,
  type DemandForecast,
  type InsertDemandForecast,
  type ScheduleTemplate,
  type InsertScheduleTemplate,
  type AiRecommendation,
  type InsertAiRecommendation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Staff methods
  getStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;

  // Shift methods
  getShifts(filters?: { date?: string; staffId?: string }): Promise<Shift[]>;
  getShiftById(id: string): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;

  // Demand forecast methods
  getDemandForecasts(dateRange?: { start: string; end: string }): Promise<DemandForecast[]>;
  createDemandForecast(forecast: InsertDemandForecast): Promise<DemandForecast>;
  updateActualDemand(id: string, actualDemand: number): Promise<DemandForecast | undefined>;

  // Schedule template methods
  getScheduleTemplates(): Promise<ScheduleTemplate[]>;
  getDefaultTemplate(): Promise<ScheduleTemplate | undefined>;
  createScheduleTemplate(template: InsertScheduleTemplate): Promise<ScheduleTemplate>;

  // AI recommendations methods
  getAiRecommendations(filters?: { isRead?: boolean }): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  markRecommendationAsRead(id: string): Promise<AiRecommendation | undefined>;
}

export class MemStorage implements IStorage {
  private staff: Map<string, Staff> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private demandForecasts: Map<string, DemandForecast> = new Map();
  private scheduleTemplates: Map<string, ScheduleTemplate> = new Map();
  private aiRecommendations: Map<string, AiRecommendation> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed staff data
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

    staffMembers.forEach(member => {
      this.staff.set(member.id, member);
    });

    // Seed demand forecasts
    const today = new Date();
    const timeSlots = ["morning", "afternoon", "evening"];
    const demandData = [
      [65, 85, 45], // Monday
      [45, 65, 35], // Tuesday
      [70, 90, 50], // Wednesday
      [85, 110, 70], // Thursday
      [120, 150, 100], // Friday
      [140, 180, 120], // Saturday
      [95, 120, 80], // Sunday
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      timeSlots.forEach((slot, slotIndex) => {
        const id = randomUUID();
        const demand = demandData[i][slotIndex];
        this.demandForecasts.set(id, {
          id,
          date: dateStr,
          timeSlot: slot,
          predictedDemand: demand,
          actualDemand: i < 3 ? Math.floor(demand * (0.9 + Math.random() * 0.2)) : null,
          staffingRecommendation: Math.ceil(demand / 15),
          confidence: "85.5",
          createdAt: new Date(),
        });
      });
    }

    // Seed AI recommendations
    const recommendations = [
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
        data: { staffId: Array.from(this.staff.values()).find(s => s.name === "Emma Chen")?.id },
        isRead: false,
        createdAt: new Date(),
      },
    ];

    recommendations.forEach(rec => {
      this.aiRecommendations.set(rec.id, rec);
    });

    // Seed today's shifts
    const todayStr = today.toISOString().split('T')[0];
    const staffArray = Array.from(this.staff.values());
    const todayShifts = [
      {
        id: randomUUID(),
        staffId: staffArray[0].id,
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
        staffId: staffArray[1].id,
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
        staffId: staffArray[2].id,
        date: todayStr,
        startTime: "11:00",
        endTime: "19:00",
        position: "Server",
        status: "confirmed",
        notes: null,
        createdAt: new Date(),
      },
    ];

    todayShifts.forEach(shift => {
      this.shifts.set(shift.id, shift);
    });
  }

  // Staff methods
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(s => s.isActive);
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = {
      ...insertStaff,
      id,
      createdAt: new Date(),
      phone: insertStaff.phone || null,
      availability: insertStaff.availability || {},
      skills: insertStaff.skills || [],
      isActive: insertStaff.isActive ?? true,
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staff = this.staff.get(id);
    if (!staff) return undefined;
    
    const updated = { ...staff, ...updates };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const staff = this.staff.get(id);
    if (!staff) return false;
    
    // Soft delete
    staff.isActive = false;
    this.staff.set(id, staff);
    return true;
  }

  // Shift methods
  async getShifts(filters?: { date?: string; staffId?: string }): Promise<Shift[]> {
    let shifts = Array.from(this.shifts.values());
    
    if (filters?.date) {
      shifts = shifts.filter(s => s.date === filters.date);
    }
    
    if (filters?.staffId) {
      shifts = shifts.filter(s => s.staffId === filters.staffId);
    }
    
    return shifts;
  }

  async getShiftById(id: string): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const shift: Shift = {
      ...insertShift,
      id,
      createdAt: new Date(),
      status: insertShift.status || "scheduled",
      notes: insertShift.notes || null,
    };
    this.shifts.set(id, shift);
    return shift;
  }

  async updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    
    const updated = { ...shift, ...updates };
    this.shifts.set(id, updated);
    return updated;
  }

  async deleteShift(id: string): Promise<boolean> {
    return this.shifts.delete(id);
  }

  // Demand forecast methods
  async getDemandForecasts(dateRange?: { start: string; end: string }): Promise<DemandForecast[]> {
    let forecasts = Array.from(this.demandForecasts.values());
    
    if (dateRange) {
      forecasts = forecasts.filter(f => 
        f.date >= dateRange.start && f.date <= dateRange.end
      );
    }
    
    return forecasts.sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDemandForecast(insertForecast: InsertDemandForecast): Promise<DemandForecast> {
    const id = randomUUID();
    const forecast: DemandForecast = {
      ...insertForecast,
      id,
      createdAt: new Date(),
      actualDemand: insertForecast.actualDemand || null,
    };
    this.demandForecasts.set(id, forecast);
    return forecast;
  }

  async updateActualDemand(id: string, actualDemand: number): Promise<DemandForecast | undefined> {
    const forecast = this.demandForecasts.get(id);
    if (!forecast) return undefined;
    
    forecast.actualDemand = actualDemand;
    this.demandForecasts.set(id, forecast);
    return forecast;
  }

  // Schedule template methods
  async getScheduleTemplates(): Promise<ScheduleTemplate[]> {
    return Array.from(this.scheduleTemplates.values());
  }

  async getDefaultTemplate(): Promise<ScheduleTemplate | undefined> {
    return Array.from(this.scheduleTemplates.values()).find(t => t.isDefault);
  }

  async createScheduleTemplate(insertTemplate: InsertScheduleTemplate): Promise<ScheduleTemplate> {
    const id = randomUUID();
    const template: ScheduleTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      description: insertTemplate.description || null,
      isDefault: insertTemplate.isDefault ?? false,
    };
    this.scheduleTemplates.set(id, template);
    return template;
  }

  // AI recommendations methods
  async getAiRecommendations(filters?: { isRead?: boolean }): Promise<AiRecommendation[]> {
    let recommendations = Array.from(this.aiRecommendations.values());
    
    if (filters?.isRead !== undefined) {
      recommendations = recommendations.filter(r => r.isRead === filters.isRead);
    }
    
    return recommendations.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async createAiRecommendation(insertRecommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const id = randomUUID();
    const recommendation: AiRecommendation = {
      ...insertRecommendation,
      id,
      isRead: false,
      createdAt: new Date(),
      data: insertRecommendation.data || {},
      priority: insertRecommendation.priority || 'medium',
    };
    this.aiRecommendations.set(id, recommendation);
    return recommendation;
  }

  async markRecommendationAsRead(id: string): Promise<AiRecommendation | undefined> {
    const recommendation = this.aiRecommendations.get(id);
    if (!recommendation) return undefined;
    
    recommendation.isRead = true;
    this.aiRecommendations.set(id, recommendation);
    return recommendation;
  }
}

export const storage = new MemStorage();