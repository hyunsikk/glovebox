// Sample data for demo purposes
import { VehicleStorage, ServiceStorage, FuelStorage, IssueStorage, SnapshotStorage, SettingsStorage } from './storage';

export const addSampleData = async () => {
  try {
    // Add sample vehicles
    const vehicle1 = await VehicleStorage.add({
      year: 2022,
      make: 'Toyota',
      model: 'RAV4',
      nickname: 'Daily Driver',
      initialMileage: 15000,
      currentMileage: 32400,
      purchaseDate: '2022-03-10',
      vin: '2T3P1RFV0NW123456',
      location: 'Home garage',
      isSample: true,
    });

    // ─── Vehicle 1: Toyota RAV4 — Services ───
    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Oil Change',
      date: '2024-11-08',
      mileage: 32000,
      cost: 72.99,
      vendor: 'Toyota Service Center',
      notes: 'Full synthetic 0W-20. Filter replaced.',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Tire Rotation',
      date: '2024-11-08',
      mileage: 32000,
      cost: 35.00,
      vendor: 'Toyota Service Center',
      notes: 'Rotated front to back, cross pattern.',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Oil Change',
      date: '2024-06-12',
      mileage: 28500,
      cost: 65.99,
      vendor: 'Toyota Service Center',
      notes: 'Full synthetic 0W-20',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Brake Inspection',
      date: '2024-06-12',
      mileage: 28500,
      cost: 0,
      vendor: 'Toyota Service Center',
      notes: 'Front pads at 6mm, rear at 8mm. Good for another 15K.',
    });

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
      serviceType: 'Cabin Air Filter',
      date: '2023-10-22',
      mileage: 22000,
      cost: 42.50,
      vendor: 'Local Auto Shop',
      notes: 'OEM replacement filter',
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
      serviceType: 'Multi-Point Inspection',
      date: '2023-08-10',
      mileage: 20000,
      cost: 0,
      vendor: 'Toyota Service Center',
      notes: 'All systems check. Battery at 92%.',
    });

    await ServiceStorage.add({
      vehicleId: vehicle1.id,
      serviceType: 'Engine Air Filter',
      date: '2023-05-01',
      mileage: 18000,
      cost: 38.00,
      vendor: 'AutoZone DIY',
      notes: 'K&N drop-in replacement',
      diyLog: { difficulty: 'Easy', timeTaken: 10 },
    });

    // ─── Vehicle 1: Toyota RAV4 — Fuel Logs (18 months of fill-ups) ───
    // Earlier fill-ups for longer MPG trend
    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2023-06-15',
      odometer: 17500,
      gallons: 11.0,
      pricePerGallon: 3.89,
      totalCost: 42.79,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2023-07-10',
      odometer: 18000,
      gallons: 10.8,
      pricePerGallon: 3.95,
      totalCost: 42.66,
      fullTank: true,
      station: 'Shell',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2023-08-20',
      odometer: 19500,
      gallons: 11.5,
      pricePerGallon: 4.15,
      totalCost: 47.73,
      fullTank: true,
      station: 'Chevron',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2023-10-01',
      odometer: 21500,
      gallons: 12.0,
      pricePerGallon: 4.39,
      totalCost: 52.68,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2023-12-15',
      odometer: 23500,
      gallons: 11.8,
      pricePerGallon: 4.09,
      totalCost: 48.26,
      fullTank: true,
      station: 'Arco',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-02-20',
      odometer: 25500,
      gallons: 12.2,
      pricePerGallon: 4.19,
      totalCost: 51.12,
      fullTank: true,
      station: 'Shell',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-04-15',
      odometer: 27000,
      gallons: 11.5,
      pricePerGallon: 4.45,
      totalCost: 51.18,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-06-20',
      odometer: 28800,
      gallons: 11.9,
      pricePerGallon: 4.55,
      totalCost: 54.15,
      fullTank: true,
      station: 'Chevron',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-12-01',
      odometer: 32400,
      gallons: 11.8,
      pricePerGallon: 4.29,
      totalCost: 50.62,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-11-18',
      odometer: 32050,
      gallons: 10.5,
      pricePerGallon: 4.19,
      totalCost: 44.00,
      fullTank: true,
      station: 'Shell',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-11-02',
      odometer: 31650,
      gallons: 12.1,
      pricePerGallon: 4.35,
      totalCost: 52.64,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-10-15',
      odometer: 31200,
      gallons: 11.3,
      pricePerGallon: 4.49,
      totalCost: 50.74,
      fullTank: true,
      station: 'Chevron',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-09-28',
      odometer: 30750,
      gallons: 10.9,
      pricePerGallon: 4.39,
      totalCost: 47.85,
      fullTank: true,
      station: 'Shell',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-09-10',
      odometer: 30300,
      gallons: 11.6,
      pricePerGallon: 4.25,
      totalCost: 49.30,
      fullTank: true,
      station: 'Costco Gas',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-08-22',
      odometer: 29800,
      gallons: 12.0,
      pricePerGallon: 4.55,
      totalCost: 54.60,
      fullTank: true,
      station: 'Chevron',
      type: 'fuel',
    });

    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-07-30',
      odometer: 29300,
      gallons: 11.4,
      pricePerGallon: 4.69,
      totalCost: 53.47,
      fullTank: true,
      station: 'Shell',
      type: 'fuel',
    });

    // ─── Vehicle 1: Toyota RAV4 — Issues ───
    await IssueStorage.add({
      vehicleId: vehicle1.id,
      title: 'Windshield chip',
      description: 'Small rock chip on driver side, lower left corner. About 3mm diameter.',
      severity: 'minor',
      status: 'open',
      date: '2024-10-05',
      odometer: 31100,
      cost: 75,
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
    // Only remove demo/sample vehicles — never the user's real vehicles.
    for (const vehicle of vehicles) {
      if (vehicle.isSample) await VehicleStorage.delete(vehicle.id);
    }

    console.log('Sample data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};
