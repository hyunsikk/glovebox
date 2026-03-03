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
export function getVehicleSchedule(make, model, years) {
  const data = getData();
  
  const vehicleInfo = data.vehicles.find(
    v => v.make.toLowerCase() === make.toLowerCase() && 
         v.model.toLowerCase() === model.toLowerCase() &&
         (years ? v.years === years : true) // Handle case where years might be optional
  );

  return vehicleInfo ? vehicleInfo.schedule : [];
}