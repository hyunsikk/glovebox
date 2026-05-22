/**
 * Vehicle Database - Lazy-loading wrapper for vehicles.json
 *
 * Offline-first with remote updates: the app ships a bundled copy of
 * vehicles.json as the baseline. On launch (throttled) and on demand it checks
 * a manifest on the public carstory-data Pages site; if a newer version exists
 * it downloads, validates, caches it to disk, and serves that instead — so data
 * updates reach users without an App Store release.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const MANIFEST_URL = 'https://support-teamam.github.io/carstory-data/data/manifest.json';
const SUPPORTED_SCHEMA = 2;                  // ignore remote data with a newer schema; v2 adds per-vehicle scheduleSource
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const DATA_FILE = (FileSystem.documentDirectory || '') + 'vehicles_remote.json';
const K_VERSION = '@autolog_vehicledb_version';
const K_UPDATED = '@autolog_vehicledb_updated';
const K_LASTCHECK = '@autolog_vehicledb_lastcheck';

let _bundled = null;   // bundled baseline (offline-first)
let _remote = null;    // cached/remote data once loaded
let _index = null;
let _meta = { source: 'bundled', version: 0, updatedAt: null, vehicleCount: 0 };

function bundled() {
  if (!_bundled) _bundled = require('../content/v1/vehicles.json');
  return _bundled;
}

/** Active dataset: remote if loaded, else the bundled baseline. */
function getData() {
  return _remote || bundled();
}

function setActive(data, meta) {
  _remote = data;
  _index = null; // rebuilt lazily from the new data
  _meta = { ..._meta, ...meta };
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
    // Entries generated from generic interval rules (not OEM data) are flagged
    // so the UI labels them "standard schedule" rather than "manufacturer
    // schedule". Curated/OEM entries have no scheduleSource and stay isGeneric:false.
    return { schedule: vehicleInfo.schedule, isGeneric: vehicleInfo.scheduleSource === 'generic' };
  }
  return { schedule: GENERIC_SCHEDULE, isGeneric: true };
}

// --- Remote update layer -----------------------------------------------------

async function fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Load any previously-downloaded dataset from disk into memory. Call once at
 * startup, before screens read the DB. No-op (keeps bundled) if none cached.
 */
export async function initVehicleDB() {
  try {
    const version = parseInt((await AsyncStorage.getItem(K_VERSION)) || '0', 10);
    if (version > 0 && FileSystem.documentDirectory) {
      const json = await FileSystem.readAsStringAsync(DATA_FILE).catch(() => null);
      if (json) {
        const data = JSON.parse(json);
        if (Array.isArray(data?.vehicles) && data.vehicles.length > 0) {
          const updatedAt = await AsyncStorage.getItem(K_UPDATED);
          setActive(data, { source: 'remote', version, updatedAt, vehicleCount: data.vehicles.length });
        }
      }
    }
  } catch (e) {
    // keep the bundled baseline on any failure
  }
}

/**
 * Check the manifest and download a newer dataset if available.
 * @param {{force?: boolean}} opts - force ignores the once-a-day throttle.
 * @returns {Promise<object>} result describing what happened.
 */
export async function checkForUpdate({ force = false } = {}) {
  try {
    const lastCheck = parseInt((await AsyncStorage.getItem(K_LASTCHECK)) || '0', 10);
    if (!force && Date.now() - lastCheck < CHECK_INTERVAL_MS) {
      return { skipped: 'throttled' };
    }

    const manifest = await fetchJson(MANIFEST_URL, 10000);
    await AsyncStorage.setItem(K_LASTCHECK, String(Date.now()));

    if (typeof manifest?.version !== 'number' || !manifest.url) return { error: 'bad manifest' };
    if ((manifest.schema || 1) > SUPPORTED_SCHEMA) return { skipped: 'schema' };

    const currentVersion = parseInt((await AsyncStorage.getItem(K_VERSION)) || '0', 10);
    if (manifest.version <= currentVersion) return { upToDate: true, version: currentVersion };

    const data = await fetchJson(manifest.url, 20000);
    // Integrity: structural + count check. HTTPS covers tampering; the count
    // check catches a truncated/partial download. (sha256 verify is a planned
    // hardening step once expo-crypto is added.)
    if (!Array.isArray(data?.vehicles) || data.vehicles.length === 0) return { error: 'invalid data' };
    if (manifest.vehicleCount && data.vehicles.length !== manifest.vehicleCount) return { error: 'count mismatch' };

    const updatedAt = new Date().toISOString();
    // Persist to disk FIRST. If this throws, the outer catch handles it and we
    // do NOT advance the stored version — otherwise a failed write would leave
    // AsyncStorage pointing at a version with no backing file, permanently
    // wedging the app on bundled data.
    if (FileSystem.documentDirectory) {
      await FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(data));
    }
    await AsyncStorage.multiSet([[K_VERSION, String(manifest.version)], [K_UPDATED, updatedAt]]);
    setActive(data, { source: 'remote', version: manifest.version, updatedAt, vehicleCount: data.vehicles.length });
    return { updated: true, version: manifest.version, vehicleCount: data.vehicles.length };
  } catch (e) {
    await AsyncStorage.setItem(K_LASTCHECK, String(Date.now())).catch(() => {});
    return { error: e?.message || 'update failed' };
  }
}

/** Metadata about the active dataset, for display in Settings. */
export function getDataMeta() {
  const vehicleCount = _meta.vehicleCount || (getData().vehicles?.length || 0);
  return { ..._meta, vehicleCount };
}