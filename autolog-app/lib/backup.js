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
import { collectImageFiles, restoreImageFiles, rewriteImageUris } from './imageBackup';

const BACKUP_FILENAME = 'carstory-backup.json';
const LAST_BACKUP_KEY = '@autolog_last_backup_at';
const LAST_LOCATION_KEY = '@autolog_last_backup_location'; // 'icloud' | 'local'
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

// Local fallback: a real file on native (documentDirectory), AsyncStorage on
// web. NOT reinstall-safe on its own — it always runs as a mirror so there is
// some on-device copy even when iCloud is the primary target. write() returns
// the location it wrote to.
const localAdapter = {
  kind: 'local',
  async write(contents) {
    if (FileSystem.documentDirectory) {
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + BACKUP_FILENAME, contents);
    } else {
      await AsyncStorage.setItem('@autolog_backup_blob', contents);
    }
    return 'local';
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
  async available() {
    return false;
  },
};

// iCloud adapter — present once the native module (modules/icloud-backup) is in
// the build. Required lazily inside try/catch so web, Expo Go, and the
// pre-iCloud production build fall straight through to the local adapter.
// write() always mirrors to local too, so a backup is never lost if iCloud is
// momentarily unavailable. write/read fall back to local on any iCloud error.
function loadICloudAdapter() {
  try {
    if (Platform.OS !== 'ios') return null;
    const native = require('../modules/icloud-backup').default;
    if (!native || typeof native.write !== 'function') return null;
    return {
      kind: 'icloud',
      async write(contents) {
        try {
          if (await native.isAvailable()) {
            await native.write(contents);
            await localAdapter.write(contents); // keep an on-device mirror
            return 'icloud';
          }
        } catch (e) {
          console.warn('iCloud backup failed, using local:', e?.message);
        }
        return localAdapter.write(contents);
      },
      async read() {
        try {
          const remote = await native.read();
          if (remote) return remote;
        } catch (e) {
          console.warn('iCloud read failed, using local:', e?.message);
        }
        return localAdapter.read();
      },
      async available() {
        try {
          return await native.isAvailable();
        } catch {
          return false;
        }
      },
    };
  } catch {
    return null;
  }
}

const iCloudAdapter = loadICloudAdapter();
const adapter = iCloudAdapter || localAdapter;

/** Whether the build can use iCloud at all (module present), regardless of sign-in. */
export function isICloudCapable() {
  return adapter.kind === 'icloud';
}

/** Whether iCloud is usable right now (module present AND signed into iCloud). */
export async function isICloudActive() {
  return adapter.available();
}

// --- public API --------------------------------------------------------------

/**
 * The complete, portable snapshot: all data plus the actual photo bytes inlined
 * (base64, keyed by filename) so a restore on another device/install has the
 * images, not dead paths. Shared by backupNow and the Settings "Export data".
 */
export async function buildBackupPayload() {
  const data = await DataUtils.exportData();
  if (data) data.imageFiles = await collectImageFiles(data.images);
  return data;
}

/** Serialize all data and write it through the active adapter. */
export async function backupNow() {
  try {
    const data = await buildBackupPayload();
    if (!data || (data.vehicles || []).length === 0) {
      return { success: false, reason: 'empty' }; // nothing worth backing up
    }
    const location = (await adapter.write(JSON.stringify(data))) || 'local';
    const at = new Date().toISOString();
    await AsyncStorage.multiSet([[LAST_BACKUP_KEY, at], [LAST_LOCATION_KEY, location]]);
    return { success: true, at, location, vehicleCount: data.vehicles.length };
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

/**
 * Restore the dataset from the backup blob. Non-destructive: snapshots current
 * data first and rolls back if the import throws, so a mis-tapped or corrupt
 * restore can't leave the user with no data.
 */
export async function restoreFromBackup() {
  try {
    const data = await readBackup();
    if (!data) return { success: false, reason: 'none' };

    let rollback = null;
    try { rollback = await DataUtils.exportData(); } catch {}

    // Write the photo bytes back into the current container and repoint each
    // image record at its restored file before importing.
    if (data.imageFiles) {
      try {
        const nameToUri = await restoreImageFiles(data.imageFiles);
        data.images = rewriteImageUris(data.images, nameToUri);
      } catch (e) {
        console.warn('Image restore partial/failed:', e?.message);
      }
      delete data.imageFiles; // don't persist the blob map into storage
    }

    try {
      await DataUtils.importData(data);
    } catch (e) {
      if (rollback) { try { await DataUtils.importData(rollback); } catch {} }
      throw e;
    }
    return { success: true, vehicleCount: (data.vehicles || []).length, savedAt: data.exportedAt || null };
  } catch (e) {
    console.error('Restore failed:', e?.message);
    return { success: false, error: e?.message || 'Restore failed' };
  }
}

export async function getBackupMeta() {
  const [lastBackupAt, lastLocation, autoRaw] = await Promise.all([
    AsyncStorage.getItem(LAST_BACKUP_KEY).catch(() => null),
    AsyncStorage.getItem(LAST_LOCATION_KEY).catch(() => null),
    AsyncStorage.getItem(AUTO_BACKUP_KEY).catch(() => null),
  ]);
  const iCloud = await isICloudActive();
  return {
    lastBackupAt,
    location: lastLocation || (iCloud ? 'icloud' : 'local'),
    iCloud,
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
