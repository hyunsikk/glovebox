import { VehicleStorage, ServiceStorage } from './storage';
import { getVehicleSchedule } from './vehicleDB';

// Load manufacturer maintenance schedules (with generic fallback)
const getMaintenanceSchedule = (make, model) => {
  const { schedule } = getVehicleSchedule(make, model);
  return schedule;
};

// Calculate days between dates
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2 - date1) / oneDay);
};

// Calculate months between dates
const monthsBetween = (date1, date2) => {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + 
         (date2.getMonth() - date1.getMonth());
};

// Estimate daily mileage from vehicle data (actual driving pattern, not hardcoded)
const estimateDailyMiles = (vehicle) => {
  const milesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);
  if (milesDriven <= 0) return 37; // US average ~13,500/yr ≈ 37/day
  
  const startDate = vehicle.purchaseDate 
    ? new Date(vehicle.purchaseDate) 
    : new Date(vehicle.createdAt);
  const days = daysBetween(startDate, new Date());
  if (days <= 0) return 37;
  
  return milesDriven / days;
};

// Get the effective "start of ownership" date
const getOwnershipStartDate = (vehicle) => {
  if (vehicle.purchaseDate) return new Date(vehicle.purchaseDate);
  // Fall back to createdAt but use initialMileage to estimate how long they've had it
  // If they entered initialMileage > 0, they got the car used — createdAt is still best guess
  return new Date(vehicle.createdAt);
};

// Vehicle Health Score Analytics
export const HealthScore = {
  // Calculate vehicle health score (% of recommended maintenance completed on time)
  calculate: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return null; // unknown, not "0% healthy"

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const schedule = getMaintenanceSchedule(vehicle.make, vehicle.model);
      
      if (schedule.length === 0) return null; // No schedule data — score is unknown, not perfect

      let totalServices = 0;
      let onTimeServices = 0;
      const currentDate = new Date();
      const vehicleStartDate = getOwnershipStartDate(vehicle);

      for (const scheduledService of schedule) {
        // Calculate how many times this service should have been done
        const monthsSinceStart = Math.max(1, monthsBetween(vehicleStartDate, currentDate));
        const milesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);
        
        const timeBasedServices = Math.floor(monthsSinceStart / scheduledService.monthInterval);
        const mileageBasedServices = Math.floor(milesDriven / scheduledService.mileInterval);
        
        const expectedServices = Math.max(timeBasedServices, mileageBasedServices);
        
        if (expectedServices > 0) {
          totalServices += expectedServices;
          
          // Count completed services of this type
          const completedServices = services.filter(s => 
            s.serviceType === scheduledService.service
          );
          
          // Check if services were done on time
          let onTimeCount = 0;
          for (let i = 0; i < Math.min(completedServices.length, expectedServices); i++) {
            // For simplicity, consider all logged services as on-time
            // In real implementation, we'd check against due dates
            onTimeCount++;
          }
          
          onTimeServices += onTimeCount;
        }
      }

      // No services were due yet (new car / not enough time or mileage): score is
      // unknown rather than a misleading perfect 100.
      return totalServices > 0 ? Math.round((onTimeServices / totalServices) * 100) : null;
    } catch (error) {
      console.error('Error calculating health score:', error);
      return null; // error = unknown, don't corrupt the fleet average with a 0
    }
  },

  // Get next due service for a vehicle
  getNextDueService: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return null;

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const schedule = getMaintenanceSchedule(vehicle.make, vehicle.model);
      
      if (schedule.length === 0) return null;

      let nextService = null;
      let earliestDue = Infinity;

      for (const scheduledService of schedule) {
        const lastService = services
          .filter(s => s.serviceType === scheduledService.service)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        // Skip services with no history
        if (!lastService) continue;

        const lastServiceDate = new Date(lastService.date);
        const dailyMiles = estimateDailyMiles(vehicle);
        const mileageDue = new Date(lastServiceDate);
        mileageDue.setDate(mileageDue.getDate() +
          Math.round(scheduledService.mileInterval / dailyMiles));

        const timeDue = new Date(lastServiceDate);
        timeDue.setMonth(timeDue.getMonth() + scheduledService.monthInterval);
        
        const dueDate = mileageDue < timeDue ? mileageDue : timeDue;

        const daysUntilDue = daysBetween(new Date(), dueDate);
        
        if (daysUntilDue < earliestDue) {
          earliestDue = daysUntilDue;
          nextService = {
            ...scheduledService,
            dueDate,
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
          };
        }
      }

      return nextService;
    } catch (error) {
      console.error('Error getting next due service:', error);
      return null;
    }
  },
};

// Cost Analytics
export const CostAnalytics = {
  // Calculate cost per mile (returns null if insufficient data for N/A display)
  getCostPerMile: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return null;

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);
      let milesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);

      // If initialMileage not set or equals currentMileage, try to estimate from service records
      if (milesDriven <= 0 && services.length >= 2) {
        const sortedServices = [...services].sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        const earliest = sortedServices[0]?.mileage;
        const latest = sortedServices[sortedServices.length - 1]?.mileage;
        if (earliest && latest && latest > earliest) {
          milesDriven = latest - earliest;
        }
      }

      if (milesDriven <= 0 || totalCost <= 0) return null;
      return totalCost / milesDriven;
    } catch (error) {
      console.error('Error calculating cost per mile:', error);
      return null;
    }
  },

  // Get monthly spending trends (last 12 months)
  getMonthlyTrends: async (vehicleId = null) => {
    try {
      const services = vehicleId 
        ? await ServiceStorage.getByVehicleId(vehicleId)
        : await ServiceStorage.getAll();

      const monthlyData = {};
      const currentDate = new Date();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = 0;
      }

      // Aggregate spending by month
      services.forEach(service => {
        if (service.cost && service.date) {
          const serviceDate = new Date(service.date);
          const monthKey = `${serviceDate.getFullYear()}-${String(serviceDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey] += service.cost;
          }
        }
      });

      return Object.entries(monthlyData).map(([month, cost]) => ({
        month,
        cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
      }));
    } catch (error) {
      console.error('Error getting monthly trends:', error);
      return [];
    }
  },

  // Predict next 12 months costs
  getCostPrediction: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return [];

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const schedule = getMaintenanceSchedule(vehicle.make, vehicle.model);
      
      if (schedule.length === 0) return [];

      const predictions = [];
      const currentDate = new Date();
      
      // Estimate monthly mileage based on vehicle data
      const ownershipStart = getOwnershipStartDate(vehicle);
      // Math.max guards a future purchase date (negative months would invert the rate).
      const monthsOwned = Math.max(1, monthsBetween(ownershipStart, currentDate));
      const totalMilesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);
      // Fall back to ~30 mi/day (~900 mi/month) if no mileage data
      const avgMilesPerMonth = totalMilesDriven > 0 ? totalMilesDriven / monthsOwned : 900;

      const windowEnd = new Date(currentDate);
      windowEnd.setMonth(windowEnd.getMonth() + 12);

      // 12 month buckets keyed by YYYY-MM.
      const bucketIndex = {};
      for (let month = 1; month <= 12; month++) {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + month);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        bucketIndex[key] = predictions.length;
        predictions.push({ month: key, predictedCost: 0 });
      }

      // Walk every due date for each service across the window — so recurring
      // services (and services with no history) are counted each time they fall
      // due, not just once.
      for (const scheduledService of schedule) {
        const avgCost = (scheduledService.estimatedCost[0] + scheduledService.estimatedCost[1]) / 2;
        const mileDays = avgMilesPerMonth > 0
          ? scheduledService.mileInterval / (avgMilesPerMonth / 30)
          : Infinity;
        const intervalDays = Math.max(15, Math.min((scheduledService.monthInterval || 12) * 30, mileDays));

        const lastService = services
          .filter(s => s.serviceType === scheduledService.service)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        let due = lastService ? new Date(lastService.date) : new Date(currentDate);
        due.setDate(due.getDate() + intervalDays);
        if (due < currentDate) due = new Date(currentDate); // overdue → due now

        let guard = 0;
        while (due <= windowEnd && guard < 60) {
          const key = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}`;
          if (key in bucketIndex) predictions[bucketIndex[key]].predictedCost += avgCost;
          due = new Date(due);
          due.setDate(due.getDate() + intervalDays);
          guard++;
        }
      }

      return predictions.map(p => ({ month: p.month, predictedCost: Math.round(p.predictedCost * 100) / 100 }));
    } catch (error) {
      console.error('Error getting cost prediction:', error);
      return [];
    }
  },

  // Get total maintenance cost for a vehicle
  getTotalCost: async (vehicleId) => {
    try {
      const services = await ServiceStorage.getByVehicleId(vehicleId);
      return services.reduce((sum, service) => sum + (service.cost || 0), 0);
    } catch (error) {
      console.error('Error getting total cost:', error);
      return 0;
    }
  },

  // Compare costs to average for make/model (static data for now)
  getAverageComparison: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return null;

      const userCostPerMile = await CostAnalytics.getCostPerMile(vehicleId);

      // Static average data (in a real app, this would come from a database)
      const averageData = {
        'Toyota': 0.08,
        'Honda': 0.07,
        'Ford': 0.09,
        'Chevrolet': 0.09,
        'BMW': 0.15,
        'Tesla': 0.04,
        'Subaru': 0.08,
        'Nissan': 0.08,
      };

      const averageCostPerMile = averageData[vehicle.make] || 0.08;
      const percentageDifference = userCostPerMile != null && userCostPerMile > 0
        ? Math.round(((userCostPerMile - averageCostPerMile) / averageCostPerMile) * 100)
        : 0;

      return {
        userCostPerMile: userCostPerMile != null ? Math.round(userCostPerMile * 100) / 100 : null,
        averageCostPerMile,
        percentageDifference,
        isAboveAverage: percentageDifference > 0,
      };
    } catch (error) {
      console.error('Error getting average comparison:', error);
      return null;
    }
  },
};

// Service Due Calculations
export const ServiceDue = {
  // Get all upcoming services for a vehicle
  getUpcomingServices: async (vehicleId, daysAhead = 90) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return [];

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const schedule = getMaintenanceSchedule(vehicle.make, vehicle.model);
      
      if (schedule.length === 0) return [];

      const upcoming = [];
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + daysAhead);

      for (const scheduledService of schedule) {
        const lastService = services
          .filter(s => s.serviceType === scheduledService.service)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        // Skip services with no history — can't determine due date without a baseline
        if (!lastService) continue;

        const lastServiceDate = new Date(lastService.date);
        const dailyMiles = estimateDailyMiles(vehicle);
        const mileageDue = new Date(lastServiceDate);
        mileageDue.setDate(mileageDue.getDate() +
          Math.round(scheduledService.mileInterval / dailyMiles));

        const timeDue = new Date(lastServiceDate);
        timeDue.setMonth(timeDue.getMonth() + scheduledService.monthInterval);
        
        const dueDate = mileageDue < timeDue ? mileageDue : timeDue;

        if (dueDate <= futureDate) {
          const daysUntilDue = daysBetween(currentDate, dueDate);
          upcoming.push({
            ...scheduledService,
            dueDate,
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
          });
        }
      }

      return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    } catch (error) {
      console.error('Error getting upcoming services:', error);
      return [];
    }
  },

  // Check if any services are overdue
  hasOverdueServices: async (vehicleId) => {
    try {
      // Wide window so overdue items are always in the set regardless of date
      // rounding/timezone; then filter on isOverdue directly.
      const upcoming = await ServiceDue.getUpcomingServices(vehicleId, 3650);
      return upcoming.some(service => service.isOverdue);
    } catch (error) {
      console.error('Error checking overdue services:', error);
      return false;
    }
  },
};

// Fleet Analytics (for multiple vehicles)
export const FleetAnalytics = {
  // Get summary across all vehicles
  getFleetSummary: async () => {
    try {
      const vehicles = await VehicleStorage.getAll();
      
      const summary = {
        totalVehicles: vehicles.length,
        totalCost: 0,
        totalServices: 0,
        averageHealthScore: 0,
        vehiclesNeedingAttention: 0,
      };

      let scoredCount = 0;
      for (const vehicle of vehicles) {
        const cost = await CostAnalytics.getTotalCost(vehicle.id);
        const healthScore = await HealthScore.calculate(vehicle.id);
        const hasOverdue = await ServiceDue.hasOverdueServices(vehicle.id);
        const services = await ServiceStorage.getByVehicleId(vehicle.id);

        summary.totalCost += cost;
        summary.totalServices += services.length;
        if (typeof healthScore === 'number') {
          summary.averageHealthScore += healthScore;
          scoredCount++;
        }
        if (hasOverdue) summary.vehiclesNeedingAttention++;
      }

      // Average only over vehicles that actually have a score (skip unknowns).
      if (scoredCount > 0) {
        summary.averageHealthScore = Math.round(summary.averageHealthScore / scoredCount);
      }

      return summary;
    } catch (error) {
      console.error('Error getting fleet summary:', error);
      return {
        totalVehicles: 0,
        totalCost: 0,
        totalServices: 0,
        averageHealthScore: 0,
        vehiclesNeedingAttention: 0,
      };
    }
  },
};

export default {
  HealthScore,
  CostAnalytics,
  ServiceDue,
  FleetAnalytics,
};