// In-memory AsyncStorage mock so the recall cache logic is exercised for real.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k) => Promise.resolve(k in store ? store[k] : null)),
      setItem: jest.fn((k, v) => { store[k] = v; return Promise.resolve(); }),
      removeItem: jest.fn((k) => { delete store[k]; return Promise.resolve(); }),
      __reset: () => { store = {}; },
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { recallId, fetchRecalls } from '../lib/recalls';

const vehicle = { id: 'v1', make: 'Honda', model: 'Civic', year: 2018 };

const mockFetchOnce = (results) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) })
  );
};

beforeEach(() => {
  AsyncStorage.__reset();
  jest.clearAllMocks();
});

describe('recallId', () => {
  it('prefers the NHTSA campaign number', () => {
    expect(recallId({ NHTSACampaignNumber: '20V314000', Component: 'X' })).toBe('20V314000');
  });

  it('falls back to a stable content hash when no campaign number', () => {
    const r = { Component: 'FUEL PUMP', Summary: 'may fail', Remedy: 'replace' };
    expect(recallId(r)).toBe('FUEL PUMP|may fail|replace');
  });

  it('returns null for an empty record', () => {
    expect(recallId({})).toBeNull();
  });
});

describe('fetchRecalls', () => {
  it('fetches, returns results, and caches them', async () => {
    mockFetchOnce([{ NHTSACampaignNumber: 'A1' }]);
    const { recalls, fromCache } = await fetchRecalls(vehicle);
    expect(recalls).toHaveLength(1);
    expect(fromCache).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('serves a fresh cache without hitting the network', async () => {
    mockFetchOnce([{ NHTSACampaignNumber: 'A1' }]);
    await fetchRecalls(vehicle);            // populates cache
    global.fetch.mockClear();
    const { recalls, fromCache } = await fetchRecalls(vehicle);
    expect(fromCache).toBe(true);
    expect(recalls).toHaveLength(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('bypasses the cache when force is set', async () => {
    mockFetchOnce([{ NHTSACampaignNumber: 'A1' }]);
    await fetchRecalls(vehicle);
    mockFetchOnce([{ NHTSACampaignNumber: 'A1' }, { NHTSACampaignNumber: 'B2' }]);
    const { recalls } = await fetchRecalls(vehicle, { force: true });
    expect(recalls).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to cache on a network error', async () => {
    mockFetchOnce([{ NHTSACampaignNumber: 'A1' }]);
    await fetchRecalls(vehicle);
    global.fetch = jest.fn(() => Promise.reject(new Error('network down')));
    const { recalls, fromCache } = await fetchRecalls(vehicle, { force: true });
    expect(fromCache).toBe(true);
    expect(recalls).toHaveLength(1);
  });

  it('returns empty without fetching when make/model/year is missing', async () => {
    global.fetch = jest.fn();
    const { recalls } = await fetchRecalls({ id: 'v2', make: 'Honda' });
    expect(recalls).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
