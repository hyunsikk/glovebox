/**
 * Static cost benchmark dataset — generated from AAA, Edmunds, RepairPal, and YourMechanic published data.
 * Covers average annual maintenance costs by make.
 * Updated: March 2026 (based on 2024-2025 published averages)
 * 
 * Sources:
 * - AAA "Your Driving Costs" 2024 edition
 * - RepairPal reliability ratings and annual repair costs
 * - Edmunds True Cost to Own (TCO) 5-year data
 * - YourMechanic annual maintenance cost study
 */

// All costs in USD, per-year averages for vehicles aged 1-10 years
export const MAKE_BENCHMARKS = {
  'Toyota': {
    avgAnnualMaintenance: 441,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 65,
    avgTireSetCost: 640,
    avgBrakePadCost: 250,
    reliability: 9,
    tier: 'economy', // economy | midrange | premium | luxury
  },
  'Honda': {
    avgAnnualMaintenance: 428,
    avgCostPerMile: 0.08,
    avgOilChangeCost: 60,
    avgTireSetCost: 620,
    avgBrakePadCost: 240,
    reliability: 8,
    tier: 'economy',
  },
  'Hyundai': {
    avgAnnualMaintenance: 468,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 55,
    avgTireSetCost: 580,
    avgBrakePadCost: 230,
    reliability: 7,
    tier: 'economy',
  },
  'Kia': {
    avgAnnualMaintenance: 474,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 55,
    avgTireSetCost: 560,
    avgBrakePadCost: 225,
    reliability: 7,
    tier: 'economy',
  },
  'Mazda': {
    avgAnnualMaintenance: 462,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 65,
    avgTireSetCost: 620,
    avgBrakePadCost: 260,
    reliability: 8,
    tier: 'economy',
  },
  'Subaru': {
    avgAnnualMaintenance: 617,
    avgCostPerMile: 0.11,
    avgOilChangeCost: 75,
    avgTireSetCost: 680,
    avgBrakePadCost: 290,
    reliability: 7,
    tier: 'midrange',
  },
  'Nissan': {
    avgAnnualMaintenance: 500,
    avgCostPerMile: 0.10,
    avgOilChangeCost: 60,
    avgTireSetCost: 600,
    avgBrakePadCost: 250,
    reliability: 6,
    tier: 'economy',
  },
  'Ford': {
    avgAnnualMaintenance: 775,
    avgCostPerMile: 0.12,
    avgOilChangeCost: 70,
    avgTireSetCost: 700,
    avgBrakePadCost: 280,
    reliability: 6,
    tier: 'midrange',
  },
  'Chevrolet': {
    avgAnnualMaintenance: 649,
    avgCostPerMile: 0.11,
    avgOilChangeCost: 65,
    avgTireSetCost: 680,
    avgBrakePadCost: 270,
    reliability: 6,
    tier: 'midrange',
  },
  'Volkswagen': {
    avgAnnualMaintenance: 676,
    avgCostPerMile: 0.12,
    avgOilChangeCost: 85,
    avgTireSetCost: 720,
    avgBrakePadCost: 310,
    reliability: 5,
    tier: 'midrange',
  },
  'BMW': {
    avgAnnualMaintenance: 968,
    avgCostPerMile: 0.18,
    avgOilChangeCost: 160,
    avgTireSetCost: 960,
    avgBrakePadCost: 450,
    reliability: 5,
    tier: 'premium',
  },
  'Mercedes-Benz': {
    avgAnnualMaintenance: 908,
    avgCostPerMile: 0.17,
    avgOilChangeCost: 155,
    avgTireSetCost: 1020,
    avgBrakePadCost: 480,
    reliability: 5,
    tier: 'luxury',
  },
  'Audi': {
    avgAnnualMaintenance: 987,
    avgCostPerMile: 0.18,
    avgOilChangeCost: 150,
    avgTireSetCost: 940,
    avgBrakePadCost: 440,
    reliability: 5,
    tier: 'premium',
  },
  'Lexus': {
    avgAnnualMaintenance: 551,
    avgCostPerMile: 0.10,
    avgOilChangeCost: 90,
    avgTireSetCost: 800,
    avgBrakePadCost: 320,
    reliability: 9,
    tier: 'premium',
  },
  'Tesla': {
    avgAnnualMaintenance: 350,
    avgCostPerMile: 0.07,
    avgOilChangeCost: 0, // No oil changes
    avgTireSetCost: 900,
    avgBrakePadCost: 400,
    reliability: 6,
    tier: 'premium',
  },
  'Dodge': {
    avgAnnualMaintenance: 634,
    avgCostPerMile: 0.12,
    avgOilChangeCost: 70,
    avgTireSetCost: 700,
    avgBrakePadCost: 290,
    reliability: 5,
    tier: 'midrange',
  },
  'Jeep': {
    avgAnnualMaintenance: 634,
    avgCostPerMile: 0.13,
    avgOilChangeCost: 75,
    avgTireSetCost: 740,
    avgBrakePadCost: 300,
    reliability: 5,
    tier: 'midrange',
  },
  'Ram': {
    avgAnnualMaintenance: 858,
    avgCostPerMile: 0.14,
    avgOilChangeCost: 80,
    avgTireSetCost: 880,
    avgBrakePadCost: 350,
    reliability: 5,
    tier: 'midrange',
  },
  'GMC': {
    avgAnnualMaintenance: 735,
    avgCostPerMile: 0.13,
    avgOilChangeCost: 75,
    avgTireSetCost: 760,
    avgBrakePadCost: 300,
    reliability: 6,
    tier: 'midrange',
  },
  'Acura': {
    avgAnnualMaintenance: 466,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 75,
    avgTireSetCost: 720,
    avgBrakePadCost: 280,
    reliability: 8,
    tier: 'premium',
  },
};

// National average across all makes
export const NATIONAL_AVERAGE = {
  avgAnnualMaintenance: 652,
  avgCostPerMile: 0.12,
  avgOilChangeCost: 75,
};

/**
 * Get benchmark for a vehicle make.
 * Falls back to national average if make not found.
 */
export function getBenchmark(make) {
  if (!make) return { ...NATIONAL_AVERAGE, source: 'national average', reliability: null, tier: null };
  
  // Normalize make name
  const normalized = make.trim();
  const found = MAKE_BENCHMARKS[normalized] 
    || MAKE_BENCHMARKS[Object.keys(MAKE_BENCHMARKS).find(k => k.toLowerCase() === normalized.toLowerCase())];
  
  if (found) {
    return { ...found, source: normalized, matched: true };
  }
  
  return { ...NATIONAL_AVERAGE, source: 'national average', matched: false, tier: null, reliability: null };
}

/**
 * Compare user's actual costs against the benchmark.
 * Returns comparison object with deltas and verdicts.
 */
export function compareToBenchmark(make, userAnnualCost, userCostPerMile) {
  const benchmark = getBenchmark(make);
  
  const annualDelta = userAnnualCost - benchmark.avgAnnualMaintenance;
  const annualPct = benchmark.avgAnnualMaintenance > 0 
    ? ((annualDelta / benchmark.avgAnnualMaintenance) * 100) 
    : 0;
  
  const mileDelta = userCostPerMile != null && benchmark.avgCostPerMile > 0
    ? userCostPerMile - benchmark.avgCostPerMile
    : null;
  const milePct = mileDelta != null && benchmark.avgCostPerMile > 0
    ? ((mileDelta / benchmark.avgCostPerMile) * 100)
    : null;
  
  // Verdict: how user compares
  let verdict = 'average';
  if (annualPct < -15) verdict = 'excellent';
  else if (annualPct < -5) verdict = 'good';
  else if (annualPct > 15) verdict = 'high';
  else if (annualPct > 30) verdict = 'very high';
  
  return {
    benchmark,
    userAnnualCost,
    userCostPerMile,
    annualDelta,
    annualPct,
    mileDelta,
    milePct,
    verdict,
  };
}
