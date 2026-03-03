/**
 * Vehicle Database - Lazy-loading wrapper for vehicles.json
 * 
 * This module provides efficient access to vehicle data by building a lightweight index
 * on first access and lazy-loading the full data only when needed.
 */

let _data = null;
let _index = null;

/**
 * Lazy-load the full vehicle data
 */
function getData() {
  if (!_data) {
    _data = require('../content/v1/vehicles.json');
  }
  return _data;
}

/**
 * Build a lightweight index of vehicles (make, model, years, generation only)
 * This allows fast searching without loading full schedules
 */
function getIndex() {
  if (!_index) {
    const data = getData();
    _index = data.vehicles.map(vehicle => ({
      make: vehicle.make,
      model: vehicle.model,
      years: vehicle.years,
      generation: vehicle.generation,
      // Keep a reference to find the full data later
      _originalIndex: data.vehicles.indexOf(vehicle)
    }));
  }
  return _index;
}

/**
 * Search vehicles by query string
 * @param {string} query - Search query (e.g., "Toyota RAV4")
 * @returns {Array} Array of matching vehicles (make, model, years, generation)
 */
export function searchVehicles(query) {
  const index = getIndex();
  
  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const queryParts = lowerQuery.split(/\s+/);
  
  // Filter vehicles where all query parts match
  const results = index.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.years}`.toLowerCase();
    
    // All query parts must match somewhere in the combined string
    return queryParts.every(part => searchString.includes(part));
  });

  // Sort results by relevance (exact make matches first, then model matches)
  results.sort((a, b) => {
    const aExactMake = a.make.toLowerCase().startsWith(lowerQuery);
    const bExactMake = b.make.toLowerCase().startsWith(lowerQuery);
    
    if (aExactMake && !bExactMake) return -1;
    if (!aExactMake && bExactMake) return 1;
    
    const aExactModel = a.model.toLowerCase().startsWith(lowerQuery);
    const bExactModel = b.model.toLowerCase().startsWith(lowerQuery);
    
    if (aExactModel && !bExactModel) return -1;
    if (!aExactModel && bExactModel) return 1;
    
    return a.make.localeCompare(b.make);
  });

  // Limit to 15 results and remove the internal _originalIndex
  return results.slice(0, 15).map(vehicle => ({
    make: vehicle.make,
    model: vehicle.model,
    years: vehicle.years,
    generation: vehicle.generation
  }));
}

/**
 * Get the full maintenance schedule for a specific vehicle
 * @param {string} make - Vehicle make (e.g., "Toyota")
 * @param {string} model - Vehicle model (e.g., "RAV4")
 * @param {string} years - Vehicle years (e.g., "2019-2023")
 * @returns {Array} Maintenance schedule array, or empty array if not found
 */
const GENERIC_SCHEDULE = [
  { service: 'Oil Change', mileInterval: 5000, monthInterval: 6, estimatedCost: [30, 75], category: 'engine', description: 'Oil and filter replacement' },
  { service: 'Tire Rotation', mileInterval: 7500, monthInterval: 6, estimatedCost: [20, 50], category: 'tires', description: 'Rotate tires for even wear' },
  { service: 'Multi-Point Inspection', mileInterval: 15000, monthInterval: 12, estimatedCost: [0, 50], category: 'inspection', description: 'Comprehensive vehicle inspection' },
  { service: 'Brake Inspection', mileInterval: 20000, monthInterval: 12, estimatedCost: [0, 50], category: 'brakes', description: 'Inspect brake pads, rotors, and lines' },
  { service: 'Air Filter', mileInterval: 20000, monthInterval: 12, estimatedCost: [15, 40], category: 'engine', description: 'Engine air filter replacement' },
  { service: 'Cabin Air Filter', mileInterval: 20000, monthInterval: 12, estimatedCost: [15, 40], category: 'cabin', description: 'Cabin air filter replacement' },
  { service: 'Battery Check', mileInterval: 30000, monthInterval: 24, estimatedCost: [0, 25], category: 'electrical', description: 'Test battery health and terminals' },
  { service: 'Brake Fluid', mileInterval: 30000, monthInterval: 24, estimatedCost: [70, 120], category: 'brakes', description: 'Brake fluid flush and replacement' },
  { service: 'Transmission Fluid', mileInterval: 60000, monthInterval: 48, estimatedCost: [80, 200], category: 'transmission', description: 'Transmission fluid change' },
  { service: 'Coolant', mileInterval: 60000, monthInterval: 48, estimatedCost: [50, 150], category: 'engine', description: 'Coolant flush and replacement' },
  { service: 'Spark Plugs', mileInterval: 60000, monthInterval: 48, estimatedCost: [60, 200], category: 'engine', description: 'Spark plug replacement' },
];

/**
 * Get the full maintenance schedule for a specific vehicle
 * @param {string} make - Vehicle make (e.g., "Toyota")
 * @param {string} model - Vehicle model (e.g., "RAV4")
 * @param {string} years - Vehicle years (e.g., "2019-2023")
 * @returns {{ schedule: Array, isGeneric: boolean }} Maintenance schedule and whether it's generic
 */
export function getVehicleSchedule(make, model, years) {
  const data = getData();
  
  const vehicleInfo = data.vehicles.find(
    v => v.make.toLowerCase() === make.toLowerCase() && 
         v.model.toLowerCase() === model.toLowerCase() &&
         (years ? v.years === years : true) // Handle case where years might be optional
  );

  if (vehicleInfo) {
    return { schedule: vehicleInfo.schedule, isGeneric: false };
  }
  return { schedule: GENERIC_SCHEDULE, isGeneric: true };
}