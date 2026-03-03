// Sample data for demo purposes
import { VehicleStorage, ServiceStorage, SettingsStorage } from './storage';

export const addSampleData = async () => {
  try {
    // Add sample vehicles
    const vehicle1 = await VehicleStorage.add({
      year: 2022,
      make: 'Toyota',
      model: 'RAV4',
      nickname: 'Daily Driver',
      initialMileage: 15000,
      currentMileage: 28500,
    });

    const vehicle2 = await VehicleStorage.add({
      year: 2020,
      make: 'Honda',
      model: 'Civic',
      nickname: 'Weekend Car',
      initialMileage: 8000,
      currentMileage: 19500,
    });

    const vehicle3 = await VehicleStorage.add({
      year: 2021,
      make: 'BMW',
      model: '3 Series',
      nickname: 'Sport Sedan',
      initialMileage: 5000,
      currentMileage: 24000,
    });

    // Add comprehensive sample services for vehicle1 (Toyota RAV4)
    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Oil Change',
      date: '2024-02-15',
      mileage: 25000,
      cost: 65.99,
      vendor: 'Toyota Service Center',
      notes: 'Full synthetic 0W-20',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Tire Rotation',
      date: '2024-02-15',
      mileage: 25000,
      cost: 35.00,
      vendor: 'Toyota Service Center',
      notes: 'Rotated and balanced',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Oil Change',
      date: '2023-08-10',
      mileage: 20000,
      cost: 58.99,
      vendor: 'Toyota Service Center',
      notes: 'Full synthetic 0W-20',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Brake Inspection',
      date: '2023-08-10',
      mileage: 20000,
      cost: 125.00,
      vendor: 'Toyota Service Center',
      notes: 'Front pads at 7mm, rear at 9mm',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Cabin Air Filter',
      date: '2023-05-22',
      mileage: 18000,
      cost: 42.50,
      vendor: 'Local Auto Shop',
      notes: 'OEM replacement filter',
    });

    // Add sample services for vehicle2 (Honda Civic)
    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Oil Change',
      date: '2024-02-01',
      mileage: 19000,
      cost: 42.99,
      vendor: 'Quick Lube',
      notes: 'Conventional 5W-30',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Air Filter',
      date: '2024-02-01',
      mileage: 19000,
      cost: 28.50,
      vendor: 'Quick Lube',
      notes: 'Engine air filter replacement',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Oil Change',
      date: '2023-09-15',
      mileage: 15000,
      cost: 39.99,
      vendor: 'Honda Dealer',
      notes: '0W-20 synthetic blend',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Tire Rotation',
      date: '2023-09-15',
      mileage: 15000,
      cost: 25.00,
      vendor: 'Honda Dealer',
      notes: 'Rotated tires',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Brake Fluid',
      date: '2023-06-08',
      mileage: 12500,
      cost: 95.00,
      vendor: 'Independent Shop',
      notes: 'DOT 3 brake fluid flush',
    });

    // Add sample services for vehicle3 (BMW 3 Series)
    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Inspection I',
      date: '2024-01-20',
      mileage: 22000,
      cost: 285.00,
      vendor: 'BMW Service',
      notes: 'Oil service and safety inspection',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Oil Change',
      date: '2024-01-20',
      mileage: 22000,
      cost: 155.00,
      vendor: 'BMW Service',
      notes: 'BMW LL-01 synthetic oil',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Inspection II',
      date: '2023-07-15',
      mileage: 15000,
      cost: 525.00,
      vendor: 'BMW Service',
      notes: 'Comprehensive vehicle inspection',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Brake Fluid',
      date: '2023-07-15',
      mileage: 15000,
      cost: 185.00,
      vendor: 'BMW Service',
      notes: 'DOT 4 brake fluid replacement',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Cabin Filter',
      date: '2023-04-10',
      mileage: 12000,
      cost: 98.00,
      vendor: 'BMW Service',
      notes: 'Activated carbon micro filter',
    });

    // Set up user settings
    await SettingsStorage.update({
      notifications: true,
      notificationTiming: 7,
      units: 'imperial',
      currency: 'USD',
      onboardingComplete: true,
    });

    console.log('Sample data added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample data:', error);
    return false;
  }
};

export const clearSampleData = async () => {
  try {
    const vehicles = await VehicleStorage.getAll();
    for (const vehicle of vehicles) {
      await VehicleStorage.delete(vehicle.id);
    }
    
    console.log('Sample data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};