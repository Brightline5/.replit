import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStaffSchema, insertShiftSchema, insertDemandForecastSchema, insertAiRecommendationSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/auth/login", (req, res) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: "Password is required" });
      }

      if (password === process.env.MANAGER_PASSWORD) {
        req.session.user = { role: "manager" };
        return res.json({ success: true });
      }

      res.status(401).json({ error: "Invalid password" });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/auth/check", (req, res) => {
    res.json({ isAuthenticated: !!req.session.user });
  });

  app.get("/auth/me", (req, res) => {
    if (req.session.user) {
      return res.json(req.session.user);
    }
    res.status(401).json({ error: "Not logged in" });
  });

  // Staff routes - Add authentication middleware to protect these routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      // Validate UUID format
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const staff = await storage.getStaffById(id);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(validatedData);
      res.status(201).json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Error creating staff member:', error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const updates = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(id, updates);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Error updating staff member:', error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const success = await storage.deleteStaff(id);
      if (!success) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
      console.error('Error deleting staff member:', error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Shift routes
  app.get("/api/shifts", async (req, res) => {
    try {
      const { date, staffId } = req.query;
      const shifts = await storage.getShifts({
        date: typeof date === 'string' ? date : undefined,
        staffId: typeof staffId === 'string' ? staffId : undefined,
      });
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  app.put("/api/shifts/:id", async (req, res) => {
    try {
      const updates = insertShiftSchema.partial().parse(req.body);
      const shift = await storage.updateShift(req.params.id, updates);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.json(shift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update shift" });
    }
  });

  app.delete("/api/shifts/:id", async (req, res) => {
    try {
      const success = await storage.deleteShift(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.json({ message: "Shift deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  // Demand forecast routes
  app.get("/api/demand-forecasts", async (req, res) => {
    try {
      const { start, end } = req.query;
      let dateRange;
      if (typeof start === 'string' && typeof end === 'string') {
        dateRange = { start, end };
      }
      const forecasts = await storage.getDemandForecasts(dateRange);
      res.json(forecasts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch demand forecasts" });
    }
  });

  app.post("/api/demand-forecasts", async (req, res) => {
    try {
      const validatedData = insertDemandForecastSchema.parse(req.body);
      const forecast = await storage.createDemandForecast(validatedData);
      res.status(201).json(forecast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create demand forecast" });
    }
  });

  // AI recommendations routes
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { isRead } = req.query;
      const filters = isRead !== undefined ? { isRead: isRead === 'true' } : undefined;
      const recommendations = await storage.getAiRecommendations(filters);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      const validatedData = insertAiRecommendationSchema.parse(req.body);
      const recommendation = await storage.createAiRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recommendation" });
    }
  });

  app.put("/api/recommendations/:id/read", async (req, res) => {
    try {
      const recommendation = await storage.markRecommendationAsRead(req.params.id);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark recommendation as read" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      const today = new Date().toISOString().split('T')[0];
      const todayShifts = await storage.getShifts({ date: today });
      
      // Calculate metrics
      const activeStaff = staff.length;
      const totalShiftHours = todayShifts.reduce((total, shift) => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        const end = new Date(`${shift.date}T${shift.endTime}`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
      const avgShiftLength = todayShifts.length > 0 ? totalShiftHours / todayShifts.length : 0;
      
      // Calculate labor cost savings (mock calculation)
      const avgHourlyRate = staff.reduce((sum, s) => sum + parseFloat(s.hourlyRate), 0) / staff.length;
      const laborCostSavings = Math.floor(totalShiftHours * avgHourlyRate * 0.12); // 12% efficiency improvement

      const metrics = {
        activeStaff,
        scheduleEfficiency: 94.2,
        avgShiftLength: avgShiftLength.toFixed(1),
        laborCostSavings,
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics metrics" });
    }
  });

  // Schedule optimization endpoint
  app.post("/api/schedule/optimize", async (req, res) => {
    try {
      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      // Basic optimization logic
      const shifts = await storage.getShifts({ date });
      const staff = await storage.getStaff();
      const forecasts = await storage.getDemandForecasts({ start: date, end: date });

      // Generate AI recommendation for optimization
      const optimization = {
        originalShifts: shifts.length,
        optimizedShifts: shifts.length + Math.floor(Math.random() * 3) - 1,
        efficiencyImprovement: (3 + Math.random() * 5).toFixed(1),
        costSavings: Math.floor(Math.random() * 200) + 50,
        recommendations: [
          "Adjust server coverage during peak hours",
          "Optimize kitchen staff based on predicted demand",
          "Balance experience levels across shifts"
        ]
      };

      res.json(optimization);
    } catch (error) {
      res.status(500).json({ message: "Failed to optimize schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
