import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VEHICLES: '@autolog_vehicles',
  SERVICES: '@autolog_services',
  USER_SETTINGS: '@autolog_user_settings',
  IMAGES: '@autolog_images',
  DOCUMENTS: '@autolog_documents',
  FUEL_LOGS: '@autolog_fuel_logs',
  ISSUES: '@autolog_issues',
  SNAPSHOTS: '@autolog_snapshots',
  REMINDERS: '@autolog_reminders',
};

// Utility functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getCurrentDate = () => {
  return new Date().toISOString();
};

// Vehicle Storage Functions
export const VehicleStorage = {
  // Get all vehicles
  getAll: async () => {
    try {
      const vehiclesString = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
      return vehiclesString ? JSON.parse(vehiclesString) : [];
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  },

  // Add a new vehicle
  add: async (vehicleData) => {
    try {
      const vehicles = await VehicleStorage.getAll();
      const newVehicle = {
        id: generateId(),
        ...vehicleData,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      
      vehicles.push(newVehicle);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  update: async (vehicleId, updates) => {
    try {
      const vehicles = await VehicleStorage.getAll();
      const index = vehicles.findIndex(v => v.id === vehicleId);
      
      if (index === -1) {
        throw new Error('Vehicle not found');
      }

      vehicles[index] = {
        ...vehicles[index],
        ...updates,
        updatedAt: getCurrentDate(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return vehicles[index];
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  delete: async (vehicleId) => {
    try {
      const vehicles = await VehicleStorage.getAll();
      const filteredVehicles = vehicles.filter(v => v.id !== vehicleId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filteredVehicles));
      
      // Also delete all services, images, issues, and snapshots for this vehicle
      await ServiceStorage.deleteByVehicleId(vehicleId);
      await ImageStorage.deleteByVehicleId(vehicleId);
      
      // Delete all issues for this vehicle
      const issues = await IssueStorage.getAll();
      const filteredIssues = issues.filter(i => i.vehicleId !== vehicleId);
      await AsyncStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(filteredIssues));

      // Delete all snapshots for this vehicle
      const snapshots = await SnapshotStorage.getAll();
      const filteredSnapshots = snapshots.filter(s => s.vehicleId !== vehicleId);
      await AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(filteredSnapshots));
      
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getById: async (vehicleId) => {
    try {
      const vehicles = await VehicleStorage.getAll();
      return vehicles.find(v => v.id === vehicleId) || null;
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      return null;
    }
  },
};

// Service Storage Functions
export const ServiceStorage = {
  // Get all services
  getAll: async () => {
    try {
      const servicesString = await AsyncStorage.getItem(STORAGE_KEYS.SERVICES);
      return servicesString ? JSON.parse(servicesString) : [];
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  },

  // Get services for a specific vehicle
  getByVehicleId: async (vehicleId) => {
    try {
      const services = await ServiceStorage.getAll();
      return services
        .filter(s => s.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
    } catch (error) {
      console.error('Error getting services by vehicle ID:', error);
      return [];
    }
  },

  // Add a new service
  add: async (serviceData) => {
    try {
      const services = await ServiceStorage.getAll();
      const newService = {
        id: generateId(),
        ...serviceData,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      
      services.push(newService);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      return newService;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  // Update service
  update: async (serviceId, updates) => {
    try {
      const services = await ServiceStorage.getAll();
      const index = services.findIndex(s => s.id === serviceId);
      
      if (index === -1) {
        throw new Error('Service not found');
      }

      services[index] = {
        ...services[index],
        ...updates,
        updatedAt: getCurrentDate(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      return services[index];
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  delete: async (serviceId) => {
    try {
      const services = await ServiceStorage.getAll();
      const filteredServices = services.filter(s => s.id !== serviceId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filteredServices));
      
      // Also delete all images for this service
      await ImageStorage.deleteByServiceId(serviceId);
      
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Delete all services for a vehicle
  deleteByVehicleId: async (vehicleId) => {
    try {
      const services = await ServiceStorage.getAll();
      const filteredServices = services.filter(s => s.vehicleId !== vehicleId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filteredServices));
      return true;
    } catch (error) {
      console.error('Error deleting services by vehicle ID:', error);
      throw error;
    }
  },

  // Get latest service of a specific type for a vehicle
  getLatestByType: async (vehicleId, serviceType) => {
    try {
      const services = await ServiceStorage.getByVehicleId(vehicleId);
      return services
        .filter(s => s.serviceType === serviceType)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
    } catch (error) {
      console.error('Error getting latest service by type:', error);
      return null;
    }
  },
};

// User Settings Storage Functions
export const SettingsStorage = {
  // Get user settings
  get: async () => {
    try {
      const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settingsString ? JSON.parse(settingsString) : {
        notifications: true,
        notificationTiming: 7, // days before due
        units: 'imperial', // imperial/metric
        currency: 'USD',
        onboardingComplete: false,
        premiumStatus: false,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  },

  // Update user settings
  update: async (updates) => {
    try {
      const currentSettings = await SettingsStorage.get();
      const newSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: getCurrentDate(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Reset settings
  reset: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      throw error;
    }
  },
};

// Image Storage Functions
export const ImageStorage = {
  // Get all images
  getAll: async () => {
    try {
      const imagesString = await AsyncStorage.getItem(STORAGE_KEYS.IMAGES);
      return imagesString ? JSON.parse(imagesString) : [];
    } catch (error) {
      console.error('Error getting images:', error);
      return [];
    }
  },

  // Add a new image
  add: async (imageData) => {
    try {
      const images = await ImageStorage.getAll();
      const newImage = {
        id: generateId(),
        ...imageData,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      
      images.push(newImage);
      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
      return newImage;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  },

  // Get images for a specific service
  getByServiceId: async (serviceId) => {
    try {
      const images = await ImageStorage.getAll();
      return images.filter(img => img.serviceId === serviceId);
    } catch (error) {
      console.error('Error getting images by service ID:', error);
      return [];
    }
  },

  // Get images for a specific vehicle
  getByVehicleId: async (vehicleId) => {
    try {
      const images = await ImageStorage.getAll();
      return images.filter(img => img.vehicleId === vehicleId);
    } catch (error) {
      console.error('Error getting images by vehicle ID:', error);
      return [];
    }
  },

  // Get vehicle profile image
  getVehicleProfileImage: async (vehicleId) => {
    try {
      const images = await ImageStorage.getByVehicleId(vehicleId);
      // Return the most recent vehicle image, or null if none
      const vehicleImages = images
        .filter(img => img.vehicleId === vehicleId && !img.serviceId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return vehicleImages[0] || null;
    } catch (error) {
      console.error('Error getting vehicle profile image:', error);
      return null;
    }
  },

  // Update image
  update: async (imageId, updates) => {
    try {
      const images = await ImageStorage.getAll();
      const index = images.findIndex(img => img.id === imageId);
      
      if (index === -1) {
        throw new Error('Image not found');
      }

      images[index] = {
        ...images[index],
        ...updates,
        updatedAt: getCurrentDate(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
      return images[index];
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },

  // Delete image
  delete: async (imageId) => {
    try {
      const images = await ImageStorage.getAll();
      const filteredImages = images.filter(img => img.id !== imageId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filteredImages));
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Delete all images for a vehicle
  deleteByVehicleId: async (vehicleId) => {
    try {
      const images = await ImageStorage.getAll();
      const filteredImages = images.filter(img => img.vehicleId !== vehicleId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filteredImages));
      return true;
    } catch (error) {
      console.error('Error deleting images by vehicle ID:', error);
      throw error;
    }
  },

  // Delete all images for a service
  deleteByServiceId: async (serviceId) => {
    try {
      const images = await ImageStorage.getAll();
      const filteredImages = images.filter(img => img.serviceId !== serviceId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filteredImages));
      return true;
    } catch (error) {
      console.error('Error deleting images by service ID:', error);
      throw error;
    }
  },
};

// Fuel / Charging Log Storage
export const FuelStorage = {
  getAll: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting fuel logs:', error);
      return [];
    }
  },

  add: async (logData) => {
    try {
      const logs = await FuelStorage.getAll();
      const newLog = {
        id: generateId(),
        ...logData,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      logs.push(newLog);
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(logs));
      return newLog;
    } catch (error) {
      console.error('Error adding fuel log:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const logs = await FuelStorage.getAll();
      const index = logs.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Fuel log not found');
      logs[index] = { ...logs[index], ...updates, updatedAt: getCurrentDate() };
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(logs));
      return logs[index];
    } catch (error) {
      console.error('Error updating fuel log:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const logs = await FuelStorage.getAll();
      const filtered = logs.filter(l => l.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting fuel log:', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId) => {
    try {
      const logs = await FuelStorage.getAll();
      return logs
        .filter(l => l.vehicleId === vehicleId)
        .sort((a, b) => b.odometer - a.odometer);
    } catch (error) {
      console.error('Error getting fuel logs by vehicle:', error);
      return [];
    }
  },

  // Calculate MPG between consecutive full-tank fill-ups
  calculateMPG: async (vehicleId) => {
    try {
      const logs = await FuelStorage.getByVehicleId(vehicleId);
      const fullTankLogs = logs
        .filter(l => l.type === 'fuel' && l.fullTank)
        .sort((a, b) => a.odometer - b.odometer);

      const results = [];
      for (let i = 1; i < fullTankLogs.length; i++) {
        const miles = fullTankLogs[i].odometer - fullTankLogs[i - 1].odometer;
        const gallons = fullTankLogs[i].gallons;
        if (gallons > 0 && miles > 0) {
          results.push({
            date: fullTankLogs[i].date,
            mpg: Math.round((miles / gallons) * 10) / 10,
            miles,
            gallons,
            costPerMile: fullTankLogs[i].totalCost / miles,
          });
        }
      }
      return results;
    } catch (error) {
      console.error('Error calculating MPG:', error);
      return [];
    }
  },
};

// Issue Storage Functions
export const IssueStorage = {
  getAll: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ISSUES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting issues:', error);
      return [];
    }
  },

  add: async (issueData) => {
    try {
      const issues = await IssueStorage.getAll();
      const newIssue = {
        id: generateId(),
        ...issueData,
        status: issueData.status || 'open',
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      issues.push(newIssue);
      await AsyncStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
      return newIssue;
    } catch (error) {
      console.error('Error adding issue:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const issues = await IssueStorage.getAll();
      const index = issues.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Issue not found');
      
      const updatedIssue = {
        ...issues[index],
        ...updates,
        updatedAt: getCurrentDate(),
      };
      
      // Set resolvedDate when status changes to resolved
      if (updates.status === 'resolved' && issues[index].status !== 'resolved') {
        updatedIssue.resolvedDate = getCurrentDate();
      }
      // Clear resolvedDate if status changes away from resolved
      else if (updates.status && updates.status !== 'resolved') {
        updatedIssue.resolvedDate = undefined;
        updatedIssue.resolvedServiceId = undefined;
      }
      
      issues[index] = updatedIssue;
      await AsyncStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
      return updatedIssue;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const issues = await IssueStorage.getAll();
      const filtered = issues.filter(i => i.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId) => {
    try {
      const issues = await IssueStorage.getAll();
      return issues
        .filter(i => i.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting issues by vehicle:', error);
      return [];
    }
  },

  getOpenByVehicleId: async (vehicleId) => {
    try {
      const issues = await IssueStorage.getByVehicleId(vehicleId);
      return issues.filter(i => i.status === 'open' || i.status === 'in_progress');
    } catch (error) {
      console.error('Error getting open issues by vehicle:', error);
      return [];
    }
  },
};

// Snapshot Storage Functions
export const SnapshotStorage = {
  getAll: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting snapshots:', error);
      return [];
    }
  },

  add: async (snapshotData) => {
    try {
      const snapshots = await SnapshotStorage.getAll();
      const newSnapshot = {
        id: generateId(),
        ...snapshotData,
        createdAt: getCurrentDate(),
      };
      snapshots.push(newSnapshot);
      await AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
      return newSnapshot;
    } catch (error) {
      console.error('Error adding snapshot:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const snapshots = await SnapshotStorage.getAll();
      const filtered = snapshots.filter(s => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId) => {
    try {
      const snapshots = await SnapshotStorage.getAll();
      return snapshots
        .filter(s => s.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting snapshots by vehicle:', error);
      return [];
    }
  },
};

// Document Storage Functions
export const DocumentStorage = {
  getAll: async () => {
    try {
      const docs = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return docs ? JSON.parse(docs) : [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  add: async (docData) => {
    try {
      const docs = await DocumentStorage.getAll();
      const newDoc = {
        id: generateId(),
        ...docData,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      docs.push(newDoc);
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      return newDoc;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const docs = await DocumentStorage.getAll();
      const index = docs.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Document not found');
      docs[index] = { ...docs[index], ...updates, updatedAt: getCurrentDate() };
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      return docs[index];
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const docs = await DocumentStorage.getAll();
      const filtered = docs.filter(d => d.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId) => {
    try {
      const docs = await DocumentStorage.getAll();
      return docs.filter(d => d.vehicleId === vehicleId);
    } catch (error) {
      console.error('Error getting documents by vehicle:', error);
      return [];
    }
  },
};

// Recurring Maintenance Reminders Storage
export const ReminderStorage = {
  getAll: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  },

  add: async (reminderData) => {
    try {
      const reminders = await ReminderStorage.getAll();
      const newReminder = {
        id: generateId(),
        ...reminderData,
        enabled: reminderData.enabled !== false,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      reminders.push(newReminder);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return newReminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  },

  update: async (id, updates) => {
    try {
      const reminders = await ReminderStorage.getAll();
      const index = reminders.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reminder not found');
      reminders[index] = { ...reminders[index], ...updates, updatedAt: getCurrentDate() };
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return reminders[index];
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const reminders = await ReminderStorage.getAll();
      const filtered = reminders.filter(r => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId) => {
    try {
      const reminders = await ReminderStorage.getAll();
      return reminders.filter(r => r.vehicleId === vehicleId);
    } catch (error) {
      console.error('Error getting reminders by vehicle:', error);
      return [];
    }
  },

  // Get reminders that are due or overdue for a vehicle
  getDueReminders: async (vehicleId) => {
    try {
      const reminders = await ReminderStorage.getByVehicleId(vehicleId);
      const vehicle = await VehicleStorage.getById(vehicleId);
      const services = await ServiceStorage.getByVehicleId(vehicleId);

      if (!vehicle) return [];

      const dueReminders = [];

      for (const reminder of reminders.filter(r => r.enabled)) {
        const lastService = services
          .filter(s => s.serviceType === reminder.serviceType)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!lastService) continue;

        const lastServiceDate = new Date(lastService.date);
        const lastServiceMileage = lastService.mileage || 0;
        const currentMileage = vehicle.currentMileage || 0;

        let isDue = false;
        let isOverdue = false;
        let dueType = '';

        // Check mileage interval
        if (reminder.intervalMiles && currentMileage >= (lastServiceMileage + reminder.intervalMiles)) {
          isDue = true;
          dueType = 'mileage';
          if (currentMileage > (lastServiceMileage + reminder.intervalMiles + 1000)) {
            isOverdue = true;
          }
        }

        // Check time interval
        if (reminder.intervalMonths) {
          const nextDueDate = new Date(lastServiceDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + reminder.intervalMonths);
          const now = new Date();

          if (now >= nextDueDate) {
            isDue = true;
            if (dueType) dueType += ' & time';
            else dueType = 'time';

            const overdueDays = Math.floor((now - nextDueDate) / (24 * 60 * 60 * 1000));
            if (overdueDays > 7) {
              isOverdue = true;
            }
          }
        }

        if (isDue) {
          dueReminders.push({
            ...reminder,
            isDue,
            isOverdue,
            dueType,
            lastService,
            lastServiceDate: lastService.date,
            lastServiceMileage: lastService.mileage
          });
        }
      }

      return dueReminders;
    } catch (error) {
      console.error('Error getting due reminders:', error);
      return [];
    }
  },
};

// Utility functions for data operations
export const DataUtils = {
  // Clear all app data
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.VEHICLES,
        STORAGE_KEYS.SERVICES,
        STORAGE_KEYS.USER_SETTINGS,
        STORAGE_KEYS.IMAGES,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },

  // Export all data
  exportData: async () => {
    try {
      const [vehicles, services, settings, images] = await Promise.all([
        VehicleStorage.getAll(),
        ServiceStorage.getAll(),
        SettingsStorage.get(),
        ImageStorage.getAll(),
      ]);

      return {
        vehicles,
        services,
        settings,
        images,
        exportedAt: getCurrentDate(),
        version: '1.0.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data
  importData: async (data) => {
    try {
      if (data.vehicles) {
        await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(data.vehicles));
      }
      if (data.services) {
        await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      }
      if (data.settings) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.settings));
      }
      if (data.images) {
        await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(data.images));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Get storage usage info
  getStorageInfo: async () => {
    try {
      const [vehicles, services, images] = await Promise.all([
        VehicleStorage.getAll(),
        ServiceStorage.getAll(),
        ImageStorage.getAll(),
      ]);

      return {
        vehicleCount: vehicles.length,
        serviceCount: services.length,
        imageCount: images.length,
        totalEntries: vehicles.length + services.length + images.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { vehicleCount: 0, serviceCount: 0, imageCount: 0, totalEntries: 0 };
    }
  },
};

export default {
  VehicleStorage,
  ServiceStorage,
  SettingsStorage,
  ImageStorage,
  FuelStorage,
  IssueStorage,
  SnapshotStorage,
  DocumentStorage,
  ReminderStorage,
  DataUtils,
};