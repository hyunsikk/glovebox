/**
 * Paste this into the browser console at http://localhost:8081
 * to seed test vehicle + fuel/service records for testing MPG and cost analytics.
 * 
 * After pasting, refresh the page.
 */

(async () => {
  const AsyncStorage = {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, val) => { localStorage.setItem(key, val); return Promise.resolve(); },
  };

  const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  const now = new Date();

  // ── Test Vehicle ──────────────────────────────────
  const vehicleId = genId();
  const vehicle = {
    id: vehicleId,
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    nickname: 'Daily Driver',
    currentMileage: 45200,
    initialMileage: 28500,
    purchaseDate: '2023-06-15',
    conditionWhenPurchased: 'Used - Excellent',
    purchasePrice: 24500,
    primaryUse: ['commute', 'errands'],
    createdAt: new Date('2023-06-15').toISOString(),
    updatedAt: now.toISOString(),
  };

  // ── Fuel Logs (12 months of fill-ups, ~2 per month) ──
  const fuelLogs = [];
  let odo = 28500;
  const startDate = new Date('2023-07-01');
  
  for (let month = 0; month < 18; month++) {
    // 2 fill-ups per month
    for (let fillup = 0; fillup < 2; fillup++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + month);
      date.setDate(fillup === 0 ? 5 + Math.floor(Math.random() * 5) : 18 + Math.floor(Math.random() * 7));
      
      if (date > now) break;
      
      const milesDriven = 400 + Math.floor(Math.random() * 200); // 400-600 miles between fill-ups
      odo += milesDriven;
      
      const gallons = 10 + Math.round(Math.random() * 4 * 10) / 10; // 10-14 gallons
      const pricePerGallon = 3.2 + Math.round(Math.random() * 1.5 * 100) / 100; // $3.20-$4.70
      const totalCost = Math.round(gallons * pricePerGallon * 100) / 100;
      
      const stations = ['Costco Gas', 'Shell', 'Chevron', 'Arco', '76', 'Safeway Fuel'];
      
      fuelLogs.push({
        id: genId(),
        vehicleId,
        type: 'fuel',
        date: date.toISOString().split('T')[0],
        odometer: odo,
        gallons,
        pricePerGallon,
        totalCost,
        fullTank: true,
        station: stations[Math.floor(Math.random() * stations.length)],
        octane: Math.random() > 0.8 ? '91' : '87',
        notes: null,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
  }

  // ── Service Records ──────────────────────────────
  const serviceRecords = [
    { type: 'Oil Change', date: '2023-08-15', mileage: 30200, cost: 65, vendor: 'Valvoline Instant' },
    { type: 'Oil Change', date: '2023-12-10', mileage: 33800, cost: 72, vendor: 'Valvoline Instant' },
    { type: 'Tire Rotation', date: '2024-01-20', mileage: 34500, cost: 30, vendor: 'Costco Tire Center' },
    { type: 'Oil Change', date: '2024-04-05', mileage: 37200, cost: 69, vendor: 'Jiffy Lube' },
    { type: 'Brake Pad Replacement', date: '2024-06-18', mileage: 39000, cost: 380, vendor: 'Meineke' },
    { type: 'Oil Change', date: '2024-08-12', mileage: 40800, cost: 75, vendor: 'Valvoline Instant' },
    { type: 'Tire Rotation', date: '2024-09-22', mileage: 41200, cost: 0, vendor: 'DIY' },
    { type: 'Air Filter', date: '2024-10-05', mileage: 41500, cost: 25, vendor: 'DIY' },
    { type: 'Oil Change', date: '2024-12-20', mileage: 43100, cost: 72, vendor: 'Valvoline Instant' },
    { type: 'Windshield Wiper Replacement', date: '2025-01-15', mileage: 43800, cost: 35, vendor: 'AutoZone' },
    { type: 'Oil Change', date: '2025-03-01', mileage: 44900, cost: 69, vendor: 'Jiffy Lube' },
  ];

  const services = serviceRecords.map(s => ({
    id: genId(),
    vehicleId,
    serviceType: s.type,
    date: s.date,
    mileage: s.mileage,
    cost: s.cost,
    vendor: s.vendor,
    notes: null,
    createdAt: new Date(s.date).toISOString(),
    updatedAt: new Date(s.date).toISOString(),
  }));

  // ── Issues ──────────────────────────────
  const testIssues = [
    {
      id: genId(),
      vehicleId,
      title: 'Squeaking noise when turning left',
      description: 'Noticed a faint squeak from front-left when making sharp left turns at low speed. Seems to happen more in cold weather.',
      severity: 'moderate',
      status: 'open',
      date: '2025-02-10T00:00:00.000Z',
      odometer: 44500,
      history: [
        { id: genId(), type: 'created', timestamp: '2025-02-10T10:00:00.000Z', status: 'open', severity: 'moderate', note: null },
        { id: genId(), type: 'note', timestamp: '2025-02-15T14:30:00.000Z', note: 'Mechanic said it might be a CV joint. Getting a quote.' },
        { id: genId(), type: 'severity_change', timestamp: '2025-02-20T09:00:00.000Z', from: 'moderate', to: 'serious', note: null },
      ],
      createdAt: '2025-02-10T10:00:00.000Z',
      updatedAt: '2025-02-20T09:00:00.000Z',
    },
  ];

  // ── Write to AsyncStorage ──────────────────────
  // Merge with existing data
  const existingVehicles = JSON.parse(await AsyncStorage.getItem('@autolog_vehicles') || '[]');
  const existingServices = JSON.parse(await AsyncStorage.getItem('@autolog_services') || '[]');
  const existingFuel = JSON.parse(await AsyncStorage.getItem('@autolog_fuel_logs') || '[]');
  const existingIssues = JSON.parse(await AsyncStorage.getItem('@autolog_issues') || '[]');

  await AsyncStorage.setItem('@autolog_vehicles', JSON.stringify([...existingVehicles, vehicle]));
  await AsyncStorage.setItem('@autolog_services', JSON.stringify([...existingServices, ...services]));
  await AsyncStorage.setItem('@autolog_fuel_logs', JSON.stringify([...existingFuel, ...fuelLogs]));
  await AsyncStorage.setItem('@autolog_issues', JSON.stringify([...existingIssues, ...testIssues]));

  // Update vehicle mileage to latest
  vehicle.currentMileage = odo;
  const allVehicles = JSON.parse(await AsyncStorage.getItem('@autolog_vehicles'));
  const idx = allVehicles.findIndex(v => v.id === vehicleId);
  if (idx !== -1) allVehicles[idx] = vehicle;
  await AsyncStorage.setItem('@autolog_vehicles', JSON.stringify(allVehicles));

  console.log('✅ Test data seeded!');
  console.log(`   Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.nickname})`);
  console.log(`   Fuel logs: ${fuelLogs.length}`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Issues: ${testIssues.length}`);
  console.log(`   Current mileage: ${odo.toLocaleString()} mi`);
  console.log('');
  console.log('🔄 Refresh the page to see the data.');
})();
