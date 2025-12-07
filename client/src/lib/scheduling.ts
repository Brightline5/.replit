import { Staff, Shift, DemandForecast } from '@shared/schema';

export interface ScheduleConstraints {
  minStaffPerShift: number;
  maxHoursPerWeek: number;
  overtimeThreshold: number;
  preferredStaffPerPosition: { [position: string]: number };
}

export interface OptimizationResult {
  shifts: Shift[];
  efficiency: number;
  costSavings: number;
  violations: string[];
  recommendations: string[];
}

export interface TimeSlot {
  start: string;
  end: string;
  requiredStaff: number;
  position: string;
}

export const defaultConstraints: ScheduleConstraints = {
  minStaffPerShift: 3,
  maxHoursPerWeek: 40,
  overtimeThreshold: 40,
  preferredStaffPerPosition: {
    'Server': 4,
    'Line Cook': 2,
    'Head Server': 1,
    'Host': 1,
    'Manager': 1,
  },
};

/**
 * Calculate the optimal number of staff needed based on predicted demand
 */
export function calculateStaffNeeds(
  demand: number,
  timeSlot: 'morning' | 'afternoon' | 'evening'
): { [position: string]: number } {
  const baseRatio = {
    morning: { Server: 0.15, 'Line Cook': 0.08, Host: 0.05 },
    afternoon: { Server: 0.18, 'Line Cook': 0.10, Host: 0.06 },
    evening: { Server: 0.22, 'Line Cook': 0.12, Host: 0.08 },
  };

  const ratios = baseRatio[timeSlot];
  const needs: { [position: string]: number } = {};

  Object.entries(ratios).forEach(([position, ratio]) => {
    needs[position] = Math.max(1, Math.ceil(demand * ratio));
  });

  // Always need at least one manager for evening shifts
  if (timeSlot === 'evening') {
    needs['Manager'] = 1;
  }

  return needs;
}

/**
 * Generate optimal schedule based on demand forecasts and staff availability
 */
export function generateOptimalSchedule(
  staff: Staff[],
  forecasts: DemandForecast[],
  constraints: ScheduleConstraints = defaultConstraints
): OptimizationResult {
  const shifts: Shift[] = [];
  const violations: string[] = [];
  const recommendations: string[] = [];
  let totalCost = 0;
  let optimizedCost = 0;

  // Group forecasts by date
  const forecastsByDate = forecasts.reduce((acc, forecast) => {
    if (!acc[forecast.date]) {
      acc[forecast.date] = {};
    }
    acc[forecast.date][forecast.timeSlot] = forecast;
    return acc;
  }, {} as { [date: string]: { [timeSlot: string]: DemandForecast } });

  // Process each date
  Object.entries(forecastsByDate).forEach(([date, dayForecasts]) => {
    const dayShifts = generateDaySchedule(
      date,
      dayForecasts,
      staff,
      constraints
    );
    
    shifts.push(...dayShifts.shifts);
    violations.push(...dayShifts.violations);
    recommendations.push(...dayShifts.recommendations);
    totalCost += dayShifts.totalCost;
    optimizedCost += dayShifts.optimizedCost;
  });

  const efficiency = calculateScheduleEfficiency(shifts, staff, constraints);
  const costSavings = totalCost - optimizedCost;

  return {
    shifts,
    efficiency,
    costSavings,
    violations,
    recommendations,
  };
}

/**
 * Generate schedule for a single day
 */
function generateDaySchedule(
  date: string,
  forecasts: { [timeSlot: string]: DemandForecast },
  staff: Staff[],
  constraints: ScheduleConstraints
) {
  const shifts: Shift[] = [];
  const violations: string[] = [];
  const recommendations: string[] = [];
  let totalCost = 0;
  let optimizedCost = 0;

  const timeSlots = [
    { name: 'morning', start: '09:00', end: '15:00' },
    { name: 'afternoon', start: '15:00', end: '21:00' },
    { name: 'evening', start: '21:00', end: '02:00' },
  ];

  timeSlots.forEach(slot => {
    const forecast = forecasts[slot.name];
    if (!forecast) return;

    const staffNeeds = calculateStaffNeeds(
      forecast.predictedDemand,
      slot.name as 'morning' | 'afternoon' | 'evening'
    );

    // Assign staff to positions
    Object.entries(staffNeeds).forEach(([position, needed]) => {
      const availableStaff = staff.filter(s => 
        s.position === position && 
        s.isActive &&
        isStaffAvailable(s, date, slot.start, slot.end)
      );

      const assigned = availableStaff.slice(0, needed);
      
      if (assigned.length < needed) {
        violations.push(
          `Insufficient ${position} staff for ${slot.name} on ${date}: need ${needed}, have ${assigned.length}`
        );
      }

      assigned.forEach(staffMember => {
        const shift: Omit<Shift, 'id' | 'createdAt'> = {
          staffId: staffMember.id,
          date,
          startTime: slot.start,
          endTime: slot.end,
          position: staffMember.position,
          status: 'scheduled',
          notes: `Auto-generated for ${forecast.predictedDemand} predicted demand`,
        };

        shifts.push(shift as Shift);

        // Calculate costs
        const hours = calculateShiftHours(slot.start, slot.end);
        const cost = hours * parseFloat(staffMember.hourlyRate);
        totalCost += cost;
        optimizedCost += cost * 0.95; // Assume 5% optimization savings
      });
    });
  });

  return {
    shifts,
    violations,
    recommendations,
    totalCost,
    optimizedCost,
  };
}

/**
 * Check if staff member is available for a specific time slot
 */
function isStaffAvailable(
  staff: Staff,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  if (!staff.availability) return true;

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayAvailability = staff.availability[dayOfWeek];

  if (!dayAvailability || dayAvailability.length === 0) return false;

  return dayAvailability.some(slot => 
    slot.available &&
    slot.start <= startTime &&
    slot.end >= endTime
  );
}

/**
 * Calculate hours between two time strings
 */
function calculateShiftHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  let end = new Date(`2000-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end < start) {
    end = new Date(`2000-01-02T${endTime}`);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate overall schedule efficiency
 */
function calculateScheduleEfficiency(
  shifts: Shift[],
  staff: Staff[],
  constraints: ScheduleConstraints
): number {
  if (shifts.length === 0) return 0;

  let efficiencyScore = 100;

  // Check staff utilization
  const staffUtilization = calculateStaffUtilization(shifts, staff);
  if (staffUtilization < 0.7) {
    efficiencyScore -= (0.7 - staffUtilization) * 50;
  }

  // Check overtime violations
  const overtimeViolations = countOvertimeViolations(shifts, staff, constraints);
  efficiencyScore -= overtimeViolations * 5;

  // Check minimum staffing compliance
  const understaffedShifts = countUnderstaffedShifts(shifts, constraints);
  efficiencyScore -= understaffedShifts * 10;

  return Math.max(0, Math.min(100, efficiencyScore));
}

/**
 * Calculate staff utilization rate
 */
function calculateStaffUtilization(shifts: Shift[], staff: Staff[]): number {
  const totalAvailableHours = staff.length * 40; // Assume 40 hours max per week
  const totalScheduledHours = shifts.reduce((total, shift) => {
    return total + calculateShiftHours(shift.startTime, shift.endTime);
  }, 0);

  return totalScheduledHours / totalAvailableHours;
}

/**
 * Count overtime violations
 */
function countOvertimeViolations(
  shifts: Shift[],
  staff: Staff[],
  constraints: ScheduleConstraints
): number {
  const staffHours: { [staffId: string]: number } = {};

  shifts.forEach(shift => {
    const hours = calculateShiftHours(shift.startTime, shift.endTime);
    staffHours[shift.staffId] = (staffHours[shift.staffId] || 0) + hours;
  });

  return Object.values(staffHours).filter(
    hours => hours > constraints.overtimeThreshold
  ).length;
}

/**
 * Count understaffed shifts
 */
function countUnderstaffedShifts(
  shifts: Shift[],
  constraints: ScheduleConstraints
): number {
  const shiftsByDateTime: { [key: string]: Shift[] } = {};

  shifts.forEach(shift => {
    const key = `${shift.date}-${shift.startTime}`;
    if (!shiftsByDateTime[key]) {
      shiftsByDateTime[key] = [];
    }
    shiftsByDateTime[key].push(shift);
  });

  return Object.values(shiftsByDateTime).filter(
    shifts => shifts.length < constraints.minStaffPerShift
  ).length;
}

/**
 * Optimize existing schedule
 */
export function optimizeSchedule(
  existingShifts: Shift[],
  staff: Staff[],
  forecasts: DemandForecast[],
  constraints: ScheduleConstraints = defaultConstraints
): OptimizationResult {
  // Generate new optimal schedule
  const optimal = generateOptimalSchedule(staff, forecasts, constraints);

  // Compare with existing schedule
  const existingEfficiency = calculateScheduleEfficiency(existingShifts, staff, constraints);
  const improvementPotential = optimal.efficiency - existingEfficiency;

  const recommendations = [
    ...optimal.recommendations,
    ...(improvementPotential > 5 
      ? [`Schedule can be improved by ${improvementPotential.toFixed(1)}% efficiency`]
      : []
    ),
  ];

  return {
    ...optimal,
    recommendations,
  };
}

/**
 * Find coverage for missing shifts
 */
export function findCoverage(
  missingShift: { date: string; startTime: string; endTime: string; position: string },
  staff: Staff[]
): Staff[] {
  return staff
    .filter(s => 
      s.position === missingShift.position &&
      s.isActive &&
      isStaffAvailable(s, missingShift.date, missingShift.startTime, missingShift.endTime)
    )
    .sort((a, b) => {
      // Sort by hourly rate (lower cost first)
      return parseFloat(a.hourlyRate) - parseFloat(b.hourlyRate);
    });
}
