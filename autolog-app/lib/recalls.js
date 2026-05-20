/**
 * NHTSA recall data layer.
 *
 * Single source of truth for fetching + caching safety recalls, shared between
 * the in-app RecallCheck UI (VehicleDetailModal) and the push-notification path
 * (notifications.js). Both read/write the same `recalls_${vehicleId}` cache so a
 * background sync and a manual "Check Now" never disagree.
 *
 * NHTSA's recallsByVehicle endpoint keys on make/model/year (not VIN) and needs
 * no API key. Cache TTL is 24h to stay well under any rate concern.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PRO_FLAG_KEY = '@autolog_pro_entitled';

const cacheKey = (vehicleId) => `recalls_${vehicleId}`;
const notifiedKey = (vehicleId) => `recalls_notified_${vehicleId}`;
const FETCH_TIMEOUT_MS = 10000;

// Stable, content-based id. Must NOT depend on array position: NHTSA can return
// recalls in a different order between fetches, and a positional id would cause
// re-notification (or skipped detection) of already-seen recalls.
export const recallId = (recall) =>
  recall?.NHTSACampaignNumber ||
  [recall?.Component, recall?.Summary, recall?.Remedy].filter(Boolean).join('|').slice(0, 160) ||
  null;

// Persisted by PurchaseContext so non-React code (notification scheduler) can
// gate Pro-only behavior without a React context.
export async function isProEntitled() {
  try {
    return (await AsyncStorage.getItem(PRO_FLAG_KEY)) === 'true';
  } catch {
    return false;
  }
}

/**
 * Fetch recalls for a vehicle, using the 24h cache unless `force` is set.
 * Returns { recalls, timestamp, fromCache }. Throws on network failure only
 * when there is no usable cache to fall back to.
 */
export async function fetchRecalls(vehicle, { force = false } = {}) {
  const { id, make, model, year } = vehicle || {};
  if (!make || !model || !year) return { recalls: [], timestamp: null, fromCache: false };

  if (!force) {
    const cached = await getCachedRecalls(id);
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < CACHE_TTL_MS) {
      return { ...cached, fromCache: true };
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`NHTSA ${res.status}`);
    const data = await res.json();
    const recalls = data.results || [];
    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem(cacheKey(id), JSON.stringify({ recalls, timestamp }));
    return { recalls, timestamp, fromCache: false };
  } catch (err) {
    const cached = await getCachedRecalls(id);
    if (cached) return { ...cached, fromCache: true };
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCachedRecalls(vehicleId) {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(vehicleId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Pro-only. For each vehicle, refresh recalls and fire a local notification for
 * any campaign number we have not already notified about. Returns the count of
 * new recall notifications scheduled.
 *
 * `scheduleNotification` is injected so this module stays free of a hard
 * dependency on expo-notifications (keeps it testable and web-safe).
 */
export async function syncRecallNotifications(vehicles, scheduleNotification) {
  if (!(await isProEntitled())) return 0;
  if (!Array.isArray(vehicles) || vehicles.length === 0) return 0;

  let scheduled = 0;
  for (const vehicle of vehicles) {
    // Require an id too — without it, notifiedKey(undefined) would merge the
    // "seen" sets of every id-less vehicle and cross-suppress notifications.
    if (!vehicle?.id || !vehicle?.make || !vehicle?.model || !vehicle?.year) continue;
    try {
      const { recalls } = await fetchRecalls(vehicle);
      if (!recalls.length) continue;

      const rawNotified = await AsyncStorage.getItem(notifiedKey(vehicle.id));
      const notified = new Set(rawNotified ? JSON.parse(rawNotified) : []);
      const vehicleName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

      // Only recalls with a stable id and not yet notified.
      const fresh = recalls.filter((r) => {
        const id = recallId(r);
        return id && !notified.has(id);
      });
      if (fresh.length === 0) continue;

      // One summary notification per vehicle per sync — never a burst of N.
      // (A car with several open recalls on first run would otherwise fire
      // several notifications at once.)
      await scheduleNotification({
        title: `Safety recall: ${vehicleName}`,
        body: fresh.length === 1
          ? (fresh[0].Component
              ? `${fresh[0].Component} — tap for details and remedy.`
              : 'A new NHTSA recall affects this vehicle. Tap for details.')
          : `${fresh.length} new safety recalls — tap to review.`,
        data: { vehicleId: vehicle.id, type: 'recall' },
      });
      // Mark every fresh recall seen only after the notification is scheduled,
      // so a failure above leaves them to retry on the next run.
      for (const r of fresh) {
        const id = recallId(r);
        if (id) notified.add(id);
      }
      await AsyncStorage.setItem(notifiedKey(vehicle.id), JSON.stringify([...notified]));
      scheduled += 1;
    } catch {
      // Network/transient failure for one vehicle should not abort the rest.
    }
  }
  return scheduled;
}
