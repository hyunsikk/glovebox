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
      vin: '2T3P1RFV0NW123456',
      location: 'Home garage',
    });

    const vehicle2 = await VehicleStorage.add({
      year: 2020,
      make: 'Honda',
      model: 'Civic',
      nickname: 'Weekend Car',
      initialMileage: 8000,
      currentMileage: 24200,
      vin: '19XFC2F59LE012345',
    });

    const vehicle3 = await VehicleStorage.add({
      year: 2021,
      make: 'BMW',
      model: '3 Series',
      nickname: 'Sport Sedan',
      initialMileage: 5000,
      currentMileage: 28500,
      vin: 'WBA5R1C52M7D12345',
      location: 'Parking garage',
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

    // ─── Vehicle 1: Toyota RAV4 — Fuel Logs ───
    await FuelStorage.add({
      vehicleId: vehicle1.id,
      date: '2024-12-01',
      odometer: 32400,
      gallons: 11.8,
      pricePerGallon: 4.29,
      totalCost: 50.62,
      fullTank: true,
      station: 'Costco Gas',
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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
      type: 'gas',
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

    // ─── Vehicle 2: Honda Civic — Services ───
    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Oil Change',
      date: '2024-11-15',
      mileage: 24000,
      cost: 45.99,
      vendor: 'Quick Lube',
      notes: 'Synthetic blend 0W-20',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Tire Rotation',
      date: '2024-11-15',
      mileage: 24000,
      cost: 25.00,
      vendor: 'Quick Lube',
      notes: 'Rotated all four',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Oil Change',
      date: '2024-07-01',
      mileage: 21500,
      cost: 42.99,
      vendor: 'Honda Dealer',
      notes: '0W-20 synthetic blend',
    });

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Air Filter',
      date: '2024-07-01',
      mileage: 21500,
      cost: 28.50,
      vendor: 'Honda Dealer',
      notes: 'Engine air filter replacement',
    });

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

    await ServiceStorage.add({
      vehicleId: vehicle2.id,
      serviceType: 'Cabin Air Filter',
      date: '2023-03-20',
      mileage: 11000,
      cost: 32.00,
      vendor: 'DIY',
      notes: 'Replaced behind glove box',
      diyLog: { difficulty: 'Easy', timeTaken: 15 },
    });

    // ─── Vehicle 2: Honda Civic — Fuel Logs ───
    await FuelStorage.add({
      vehicleId: vehicle2.id,
      date: '2024-12-03',
      odometer: 24200,
      gallons: 9.2,
      pricePerGallon: 4.15,
      totalCost: 38.18,
      fullTank: true,
      station: 'Arco',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle2.id,
      date: '2024-11-20',
      odometer: 23850,
      gallons: 8.8,
      pricePerGallon: 4.09,
      totalCost: 35.99,
      fullTank: true,
      station: 'Costco Gas',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle2.id,
      date: '2024-11-05',
      odometer: 23500,
      gallons: 9.0,
      pricePerGallon: 4.25,
      totalCost: 38.25,
      fullTank: true,
      station: 'Shell',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle2.id,
      date: '2024-10-18',
      odometer: 23100,
      gallons: 8.5,
      pricePerGallon: 4.39,
      totalCost: 37.32,
      fullTank: true,
      station: 'Chevron',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle2.id,
      date: '2024-09-30',
      odometer: 22700,
      gallons: 9.1,
      pricePerGallon: 4.29,
      totalCost: 39.04,
      fullTank: true,
      station: 'Arco',
      type: 'gas',
    });

    // ─── Vehicle 2: Honda Civic — Issues ───
    await IssueStorage.add({
      vehicleId: vehicle2.id,
      title: 'Squeaky brakes on cold start',
      description: 'Light squeaking sound from front brakes for the first few stops in the morning. Goes away after warming up.',
      severity: 'minor',
      status: 'open',
      date: '2024-11-28',
      odometer: 24100,
    });

    await IssueStorage.add({
      vehicleId: vehicle2.id,
      title: 'Rear bumper scratch',
      description: 'Parking lot ding, minor clear coat scratch on rear bumper. About 4 inches long.',
      severity: 'minor',
      status: 'resolved',
      date: '2024-08-15',
      odometer: 22200,
      cost: 150,
    });

    // ─── Vehicle 3: BMW 3 Series — Services ───
    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Oil Change',
      date: '2024-10-20',
      mileage: 27500,
      cost: 165.00,
      vendor: 'BMW Service',
      notes: 'BMW LL-01 synthetic oil + filter',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Inspection I',
      date: '2024-10-20',
      mileage: 27500,
      cost: 285.00,
      vendor: 'BMW Service',
      notes: 'Oil service and safety inspection',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Brake Fluid',
      date: '2024-10-20',
      mileage: 27500,
      cost: 195.00,
      vendor: 'BMW Service',
      notes: 'DOT 4+ brake fluid replacement',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Oil Change',
      date: '2024-04-15',
      mileage: 22000,
      cost: 155.00,
      vendor: 'BMW Service',
      notes: 'BMW LL-01 synthetic oil',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Inspection II',
      date: '2023-10-10',
      mileage: 18000,
      cost: 525.00,
      vendor: 'BMW Service',
      notes: 'Comprehensive vehicle inspection',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Oil Change',
      date: '2023-10-10',
      mileage: 18000,
      cost: 155.00,
      vendor: 'BMW Service',
      notes: 'BMW LL-01 synthetic oil',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Cabin Air Filter',
      date: '2023-04-10',
      mileage: 12000,
      cost: 98.00,
      vendor: 'BMW Service',
      notes: 'Activated carbon micro filter',
    });

    await ServiceStorage.add({
      vehicleId: vehicle3.id,
      serviceType: 'Tire Rotation',
      date: '2023-04-10',
      mileage: 12000,
      cost: 0,
      vendor: 'BMW Service',
      notes: 'Staggered setup — swapped left/right only',
    });

    // ─── Vehicle 3: BMW 3 Series — Fuel Logs ───
    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-12-02',
      odometer: 28500,
      gallons: 13.5,
      pricePerGallon: 5.09,
      totalCost: 68.72,
      fullTank: true,
      station: 'Shell V-Power',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-11-18',
      odometer: 28050,
      gallons: 12.8,
      pricePerGallon: 5.15,
      totalCost: 65.92,
      fullTank: true,
      station: 'Chevron Supreme',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-11-01',
      odometer: 27600,
      gallons: 13.2,
      pricePerGallon: 5.25,
      totalCost: 69.30,
      fullTank: true,
      station: 'Shell V-Power',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-10-14',
      odometer: 27100,
      gallons: 14.0,
      pricePerGallon: 5.19,
      totalCost: 72.66,
      fullTank: true,
      station: '76',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-09-25',
      odometer: 26500,
      gallons: 13.8,
      pricePerGallon: 5.35,
      totalCost: 73.83,
      fullTank: true,
      station: 'Shell V-Power',
      type: 'gas',
    });

    await FuelStorage.add({
      vehicleId: vehicle3.id,
      date: '2024-09-05',
      odometer: 25900,
      gallons: 12.5,
      pricePerGallon: 5.45,
      totalCost: 68.13,
      fullTank: true,
      station: 'Chevron Supreme',
      type: 'gas',
    });

    // ─── Vehicle 3: BMW 3 Series — Issues ───
    await IssueStorage.add({
      vehicleId: vehicle3.id,
      title: 'Check Engine Light — Emissions',
      description: 'CEL on. Code P0171 — system too lean bank 1. May need intake cleaning or O2 sensor.',
      severity: 'moderate',
      status: 'in_progress',
      date: '2024-11-22',
      odometer: 28300,
      cost: 350,
    });

    await IssueStorage.add({
      vehicleId: vehicle3.id,
      title: 'Cracked tail light lens',
      description: 'Small crack on passenger side tail light. Still functional but moisture could get in.',
      severity: 'minor',
      status: 'open',
      date: '2024-09-10',
      odometer: 26000,
      cost: 220,
    });

    await IssueStorage.add({
      vehicleId: vehicle3.id,
      title: 'Tire pressure sensor fault',
      description: 'TPMS warning for front left. Sensor battery may be low. Reset didn\'t fix.',
      severity: 'minor',
      status: 'resolved',
      date: '2024-06-20',
      odometer: 24500,
      cost: 85,
    });

    // ─── Snapshots ───
    await SnapshotStorage.add({
      vehicleId: vehicle1.id,
      title: 'Winter check',
      date: '2024-11-15',
      odometer: 32100,
      condition: 'good',
      notes: 'Checked tires, coolant, and wipers before winter. Everything looks good.',
      openIssuesCount: 1,
      totalSpent: 415,
      fuelEfficiency: 28.5,
    });

    await SnapshotStorage.add({
      vehicleId: vehicle3.id,
      title: 'Post-inspection status',
      date: '2024-10-22',
      odometer: 27500,
      condition: 'fair',
      notes: 'Inspection I complete. CEL pending — needs diagnosis. Otherwise mechanically sound.',
      openIssuesCount: 2,
      totalSpent: 1378,
      fuelEfficiency: 24.2,
    });

    await SnapshotStorage.add({
      vehicleId: vehicle2.id,
      title: 'Summer road trip prep',
      date: '2024-06-25',
      odometer: 22000,
      condition: 'excellent',
      notes: 'All fluids topped off. Tires at 35 PSI. Ready for the trip!',
      openIssuesCount: 0,
      totalSpent: 232,
      fuelEfficiency: 35.8,
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
