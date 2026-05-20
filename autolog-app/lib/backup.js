/**
 * Backup / restore layer.
 *
 * Serializes the full local dataset (via DataUtils) into one JSON blob and
 * stores it through a pluggable adapter. The goal is durability: surviving an
 * app delete+reinstall or a device switch, which plain AsyncStorage does not.
 *
 * Adapter seam (same pattern as PurchaseContext): the real fix is iCloud, which
 * needs a native module + entitlement + EAS build. Until that's wired, a local
 * adapter (FileSystem on native, AsyncStorage on web) makes the entire
 * backup/restore UX work and verifiable today. When the iCloud module is added,
 * it becomes the active adapter with no changes to callers.
 *
 * To make backups truly reinstall-safe (the whole point), the iCloud adapter
 * must write to the user's iCloud ubiquity container — see ICLOUD_SETUP below.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { DataUtils } from './storage';

const BACKUP_FILENAME = 'carstory-backup.json';
const LAST_BACKUP_KEY = '@autolog_last_backup_at';
const AUTO_BACKUP_KEY = '@autolog_auto_backup'; // '0' to disable; default on

/*
 * ICLOUD_SETUP (device-build checklist — only you can do these):
 *  1. Apple Developer: enable the iCloud capability and create a container
 *     (e.g. iCloud.dev.teamam.glovebox) for the app id.
 *  2. app.json: add the iCloud entitlement + container via a config plugin.
 *  3. Add the native bridge (a small Expo Module, Swift) that reads/writes a
 *     file in the ubiquity container; expose it here as `iCloudAdapter`.
 *  4. EAS build + verify on device: back up, delete app, reinstall, restore.
 */

// --- adapters ----------------------------------------------------------------

// iCloud adapter — not present until the native module is wired (see above).
// Resolves to null today, so getAdapter() falls back to local storage.
function loadICloudAdapter() {
  // try { return require('../native/icloudBackup').default; } catch { return null; }
  return null;
}

// Local fallback: a real file on native (documentDirectory), AsyncStorage on
// web. NOT reinstall-safe on its own — it exists so the flow is testable and so
// there is always *some* on-device backup before iCloud is wired.
const localAdapter = {
  kind: 'local',
  async write(contents) {
    if (FileSystem.documentDirectory) {
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + BACKUP_FILENAME, contents);
    } else {
      await AsyncStorage.setItem('@autolog_backup_blob', contents);
    }
  },
  async read() {
    if (FileSystem.documentDirectory) {
      const path = FileSystem.documentDirectory + BACKUP_FILENAME;
      const info = await FileSystem.getInfoAsync(path).catch(() => ({ exists: false }));
      if (!info.exists) return null;
      return FileSystem.readAsStringAsync(path).catch(() => null);
    }
    return AsyncStorage.getItem('@autolog_backup_blob');
  },
};

const iCloudAdapter = loadICloudAdapter();
const adapter = iCloudAdapter || localAdapter;

/** Where backups are going right now: 'icloud' once wired, else 'local'. */
export function backupLocation() {
  return adapter.kind === 'icloud' ? 'icloud' : 'local';
}

export function isICloudActive() {
  return adapter.kind === 'icloud';
}

// --- public API --------------------------------------------------------------

/** Serialize all data and write it through the active adapter. */
export async function backupNow() {
  try {
    const data = await DataUtils.exportData();
    if (!data || (data.vehicles || []).length === 0) {
      return { success: false, reason: 'empty' }; // nothing worth backing up
    }
    await adapter.write(JSON.stringify(data));
    const at = new Date().toISOString();
    await AsyncStorage.setItem(LAST_BACKUP_KEY, at);
    return { success: true, at, location: backupLocation(), vehicleCount: data.vehicles.length };
  } catch (e) {
    console.error('Backup failed:', e?.message);
    return { success: false, error: e?.message || 'Backup failed' };
  }
}

/** Read the backup blob and return parsed data if a valid one exists. */
export async function readBackup() {
  try {
    const raw = await adapter.read();
    if (!raw) return null;
    const data = JSON.parse(raw);
    return DataUtils.validateImportData(data) ? data : null;
  } catch (e) {
    return null;
  }
}

export async function hasBackup() {
  return (await readBackup()) !== null;
}

/** Restore the dataset from the backup blob. Overwrites local data. */
export async function restoreFromBackup() {
  try {
    const data = await readBackup();
    if (!data) return { success: false, reason: 'none' };
    await DataUtils.importData(data);
    return { success: true, vehicleCount: (data.vehicles || []).length };
  } catch (e) {
    console.error('Restore failed:', e?.message);
    return { success: false, error: e?.message || 'Restore failed' };
  }
}

export async function getBackupMeta() {
  const lastBackupAt = await AsyncStorage.getItem(LAST_BACKUP_KEY).catch(() => null);
  const autoRaw = await AsyncStorage.getItem(AUTO_BACKUP_KEY).catch(() => null);
  return {
    lastBackupAt,
    location: backupLocation(),
    iCloud: isICloudActive(),
    autoEnabled: autoRaw !== '0',
  };
}

export async function setAutoBackup(enabled) {
  await AsyncStorage.setItem(AUTO_BACKUP_KEY, enabled ? '1' : '0');
}

async function autoBackupEnabled() {
  return (await AsyncStorage.getItem(AUTO_BACKUP_KEY).catch(() => null)) !== '0';
}

/** Debounced auto-backup, e.g. on app background. No-op if disabled. */
let _debounce = null;
export function scheduleAutoBackup({ delay = 1500 } = {}) {
  if (_debounce) clearTimeout(_debounce);
  _debounce = setTimeout(async () => {
    if (await autoBackupEnabled()) await backupNow();
  }, delay);
}

/**
 * On launch: if there's no local data but a backup exists, the caller should
 * offer to restore. Returns true when that prompt is warranted.
 */
export async function shouldOfferRestore() {
  try {
    const data = await DataUtils.exportData();
    const empty = !data || (data.vehicles || []).length === 0;
    if (!empty) return false;
    return await hasBackup();
  } catch {
    return false;
  }
}
