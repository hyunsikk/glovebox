// Static cost benchmark data by vehicle make
// Sources: AAA annual driving cost studies, Edmunds TCO data, RepairPal averages
// All costs in USD, annual figures

const COST_BENCHMARKS = {
  Toyota: {
    avgAnnualMaintenance: 441,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 65,
    avgTireCost: 640,
    reliability: 9,
  },
  Honda: {
    avgAnnualMaintenance: 428,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 60,
    avgTireCost: 620,
    reliability: 8,
  },
  BMW: {
    avgAnnualMaintenance: 968,
    avgCostPerMile: 0.18,
    avgOilChangeCost: 150,
    avgTireCost: 960,
    reliability: 5,
  },
  Ford: {
    avgAnnualMaintenance: 775,
    avgCostPerMile: 0.13,
    avgOilChangeCost: 75,
    avgTireCost: 700,
    reliability: 6,
  },
  Chevrolet: {
    avgAnnualMaintenance: 649,
    avgCostPerMile: 0.12,
    avgOilChangeCost: 70,
    avgTireCost: 680,
    reliability: 6,
  },
  Nissan: {
    avgAnnualMaintenance: 500,
    avgCostPerMile: 0.10,
    avgOilChangeCost: 60,
    avgTireCost: 620,
    reliability: 7,
  },
  Hyundai: {
    avgAnnualMaintenance: 468,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 55,
    avgTireCost: 600,
    reliability: 7,
  },
  Kia: {
    avgAnnualMaintenance: 474,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 55,
    avgTireCost: 590,
    reliability: 7,
  },
  'Mercedes-Benz': {
    avgAnnualMaintenance: 1075,
    avgCostPerMile: 0.20,
    avgOilChangeCost: 165,
    avgTireCost: 1020,
    reliability: 4,
  },
  Audi: {
    avgAnnualMaintenance: 987,
    avgCostPerMile: 0.19,
    avgOilChangeCost: 155,
    avgTireCost: 940,
    reliability: 5,
  },
  Subaru: {
    avgAnnualMaintenance: 617,
    avgCostPerMile: 0.11,
    avgOilChangeCost: 70,
    avgTireCost: 680,
    reliability: 7,
  },
  Mazda: {
    avgAnnualMaintenance: 462,
    avgCostPerMile: 0.09,
    avgOilChangeCost: 60,
    avgTireCost: 620,
    reliability: 8,
  },
  Volkswagen: {
    avgAnnualMaintenance: 815,
    avgCostPerMile: 0.15,
    avgOilChangeCost: 110,
    avgTireCost: 760,
    reliability: 5,
  },
  Lexus: {
    avgAnnualMaintenance: 551,
    avgCostPerMile: 0.10,
    avgOilChangeCost: 85,
    avgTireCost: 720,
    reliability: 9,
  },
  Tesla: {
    avgAnnualMaintenance: 410,
    avgCostPerMile: 0.07,
    avgOilChangeCost: 0,
    avgTireCost: 800,
    reliability: 6,
  },
};

export const getBenchmark = (make) => {
  if (!make) return null;
  // Try exact match first, then case-insensitive
  return COST_BENCHMARKS[make] ||
    COST_BENCHMARKS[Object.keys(COST_BENCHMARKS).find(k => k.toLowerCase() === make.toLowerCase())] ||
    null;
};

export const getAllBenchmarks = () => COST_BENCHMARKS;

export default COST_BENCHMARKS;
