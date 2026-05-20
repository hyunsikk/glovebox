/**
 * Integration test: runs the app's REAL vehicleDB loading code against the
 * actual published carstory-data files (schema 2 / version 2, 1026 vehicles),
 * with only the two native modules mocked. Verifies the app can fetch, gate,
 * validate, cache, and read the expanded dataset.
 *
 * Skips automatically if the sibling carstory-data repo isn't checked out
 * (e.g. in CI), so it never fails for an unrelated reason.
 */
import fs from 'node:fs';
import path from 'node:path';

const CARSTORY_DATA = path.resolve(__dirname, '../../../carstory-data/data');
const hasData = fs.existsSync(path.join(CARSTORY_DATA, 'manifest.json'))
  && fs.existsSync(path.join(CARSTORY_DATA, 'vehicles.json'));

// In-memory expo-file-system (the on-disk cache the app writes the dataset to).
const memFS = {};
jest.mock('expo-file-system', () => ({
  documentDirectory: '/cs-test/',
  writeAsStringAsync: jest.fn(async (p, c) => { memFS[p] = c; }),
  readAsStringAsync: jest.fn(async (p) => {
    if (memFS[p] == null) throw new Error('ENOENT');
    return memFS[p];
  }),
}));

// In-memory AsyncStorage.
jest.mock('@react-native-async-storage/async-storage', () => {
  // Persist on globalThis so the store survives jest.resetModules() (used to
  // simulate an app restart in the disk-reload test).
  globalThis.__asStore = globalThis.__asStore || {};
  const store = globalThis.__asStore;
  return {
    __esModule: true,
    default: {
      getItem: async (k) => (k in store ? store[k] : null),
      setItem: async (k, v) => { store[k] = v; },
      multiSet: async (pairs) => { for (const [k, v] of pairs) store[k] = v; },
      removeItem: async (k) => { delete store[k]; },
    },
  };
});

// Serve the actual local carstory-data files for whichever URL the app requests.
beforeAll(() => {
  global.fetch = jest.fn(async (url) => {
    const file = String(url).endsWith('manifest.json') ? 'manifest.json'
      : String(url).endsWith('vehicles.json') ? 'vehicles.json'
      : null;
    if (!file) throw new Error(`unexpected fetch: ${url}`);
    const body = fs.readFileSync(path.join(CARSTORY_DATA, file), 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(body) };
  });
});

const d = hasData ? describe : describe.skip;

d('vehicleDB loads the published schema-2 dataset', () => {
  // Real module under test (singleton; starts on the bundled baseline).
  const vdb = require('../lib/vehicleDB');

  it('accepts the schema-2 manifest and downloads the expanded dataset', async () => {
    const res = await vdb.checkForUpdate({ force: true });
    expect(res.updated).toBe(true);
    expect(res.version).toBeGreaterThanOrEqual(2);   // schema-2 publish
    expect(res.vehicleCount).toBeGreaterThan(1004);  // baseline was 1004
  });

  it('flags a new EV entry as generic with no engine-only services', () => {
    const { schedule, isGeneric } = vdb.getVehicleSchedule('Lucid', 'Air');
    expect(isGeneric).toBe(true);
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule.some((s) => s.service === 'Oil Change')).toBe(false);
    expect(schedule.some((s) => s.service === 'Spark Plugs')).toBe(false);
  });

  it('flags a new ICE entry as generic but with an oil change', () => {
    // Fiat 500 is a newly-added ICE vehicle (Fiat was a missing make).
    const { schedule, isGeneric } = vdb.getVehicleSchedule('Fiat', '500');
    expect(isGeneric).toBe(true);
    expect(schedule.some((s) => s.service === 'Oil Change')).toBe(true);
  });

  it('still treats a curated/OEM entry as manufacturer (not generic)', () => {
    const { isGeneric } = vdb.getVehicleSchedule('Acura', 'CL');
    expect(isGeneric).toBe(false);
  });

  it('search surfaces a newly-added make', () => {
    const results = vdb.searchVehicles('Volvo');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.make && r.model)).toBe(true);
  });

  it('reloads the cached dataset from disk on a fresh start', async () => {
    jest.resetModules();
    const vdb2 = require('../lib/vehicleDB');
    await vdb2.initVehicleDB();
    expect(vdb2.searchVehicles('Lucid').length).toBeGreaterThan(0);
  });
});
