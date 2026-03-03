import { VehicleStorage, ServiceStorage } from './storage';
import vehicleData from '../content/v1/vehicles.json';

// Load manufacturer maintenance schedules
const getMaintenanceSchedule = (make, model) => {
  const vehicle = vehicleData.vehicles.find(
    v => v.make.toLowerCase() === make.toLowerCase() && 
         v.model.toLowerCase() === model.toLowerCase()
  );
  return vehicle ? vehicle.schedule : [];
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
      if (!vehicle) return 0;

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const schedule = getMaintenanceSchedule(vehicle.make, vehicle.model);
      
      if (schedule.length === 0) return 100; // No schedule data available

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

      return totalServices > 0 ? Math.round((onTimeServices / totalServices) * 100) : 100;
    } catch (error) {
      console.error('Error calculating health score:', error);
      return 0;
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
        const mileageDue = new Date();
        const dailyMiles = estimateDailyMiles(vehicle);
        mileageDue.setDate(lastServiceDate.getDate() + 
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
  // Calculate cost per mile
  getCostPerMile: async (vehicleId) => {
    try {
      const vehicle = await VehicleStorage.getById(vehicleId);
      if (!vehicle) return 0;

      const services = await ServiceStorage.getByVehicleId(vehicleId);
      const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);
      const milesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);
      
      return milesDriven > 0 ? totalCost / milesDriven : 0;
    } catch (error) {
      console.error('Error calculating cost per mile:', error);
      return 0;
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
      const monthsOwned = monthsBetween(new Date(vehicle.createdAt), currentDate) || 1;
      const totalMilesDriven = vehicle.currentMileage - (vehicle.initialMileage || vehicle.currentMileage);
      const avgMilesPerMonth = totalMilesDriven / monthsOwned || 1000; // Default 1000 miles/month

      for (let month = 1; month <= 12; month++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(futureDate.getMonth() + month);
        
        let monthlyPredictedCost = 0;
        
        // Check each service type for upcoming due dates
        for (const scheduledService of schedule) {
          const lastService = services
            .filter(s => s.serviceType === scheduledService.service)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          let nextDueDate;
          if (lastService) {
            const lastServiceDate = new Date(lastService.date);
            const mileageDueDate = new Date(lastServiceDate);
            mileageDueDate.setDate(mileageDueDate.getDate() + 
              (scheduledService.mileInterval / (avgMilesPerMonth / 30)));
            
            const timeDueDate = new Date(lastServiceDate);
            timeDueDate.setMonth(timeDueDate.getMonth() + scheduledService.monthInterval);
            
            nextDueDate = mileageDueDate < timeDueDate ? mileageDueDate : timeDueDate;
          } else {
            // No previous service, assume due soon
            nextDueDate = new Date();
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }

          // Check if service is due this month
          if (nextDueDate.getFullYear() === futureDate.getFullYear() &&
              nextDueDate.getMonth() === futureDate.getMonth()) {
            const avgCost = (scheduledService.estimatedCost[0] + scheduledService.estimatedCost[1]) / 2;
            monthlyPredictedCost += avgCost;
          }
        }

        predictions.push({
          month: `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`,
          predictedCost: Math.round(monthlyPredictedCost * 100) / 100,
        });
      }

      return predictions;
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
      const percentageDifference = userCostPerMile > 0 
        ? Math.round(((userCostPerMile - averageCostPerMile) / averageCostPerMile) * 100)
        : 0;

      return {
        userCostPerMile: Math.round(userCostPerMile * 100) / 100,
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
        const mileageDue = new Date();
        const dailyMiles = estimateDailyMiles(vehicle);
        mileageDue.setDate(lastServiceDate.getDate() + 
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
      const upcoming = await ServiceDue.getUpcomingServices(vehicleId, 0);
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
        averageHealthScore: 0,
        vehiclesNeedingAttention: 0,
      };

      for (const vehicle of vehicles) {
        const cost = await CostAnalytics.getTotalCost(vehicle.id);
        const healthScore = await HealthScore.calculate(vehicle.id);
        const hasOverdue = await ServiceDue.hasOverdueServices(vehicle.id);

        summary.totalCost += cost;
        summary.averageHealthScore += healthScore;
        if (hasOverdue) summary.vehiclesNeedingAttention++;
      }

      if (vehicles.length > 0) {
        summary.averageHealthScore = Math.round(summary.averageHealthScore / vehicles.length);
      }

      return summary;
    } catch (error) {
      console.error('Error getting fleet summary:', error);
      return {
        totalVehicles: 0,
        totalCost: 0,
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