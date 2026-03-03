import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VEHICLES: '@autolog_vehicles',
  SERVICES: '@autolog_services',
  USER_SETTINGS: '@autolog_user_settings',
  IMAGES: '@autolog_images',
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
      
      // Also delete all services and images for this vehicle
      await ServiceStorage.deleteByVehicleId(vehicleId);
      await ImageStorage.deleteByVehicleId(vehicleId);
      
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
  DataUtils,
};