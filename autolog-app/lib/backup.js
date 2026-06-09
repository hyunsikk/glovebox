/**
 * Backup / restore layer — snapshot model.
 *
 * Serializes the full local dataset (+ photo bytes) into JSON blobs stored in the
 * user's iCloud Documents container (with an on-device mirror). Survives an app
 * delete+reinstall or a device switch, which plain AsyncStorage does not.
 *
 * Snapshots:
 *  - ONE rolling "auto" backup, overwritten silently on app background:
 *      cs-auto__<ts>__<vehicleCount>.json
 *  - Up to MAX_MANUAL_SNAPSHOTS named manual snapshots from "Back up now":
 *      cs-snap__<ts>__<vehicleCount>__<sanitized-label>.json
 *  - A legacy single-file backup (carstory-backup.json) is still recognized for
 *    restore so upgrading users don't lose their existing backup.
 *
 * Metadata (timestamp, vehicle count, label) is encoded in the filename so the
 * snapshot list can be built from names alone — no multi-MB file reads.
 *
 * Adapter seam: a name-based file API (writeFile/readFile/listFiles/deleteFile)
 * backed by the iCloud native module when present, else a local FileSystem /
 * AsyncStorage fallback (web, Expo Go, pre-iCloud builds).
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { DataUtils } from './storage';
import { collectImageFiles, restoreImageFiles, rewriteImageUris, basename } from './imageBackup';

const LAST_BACKUP_KEY = '@autolog_last_backup_at';
const AUTO_BACKUP_KEY = '@autolog_auto_backup'; // '0' to disable; default on

export const MAX_MANUAL_SNAPSHOTS = 3;
const AUTO_PREFIX = 'cs-auto__';
const SNAP_PREFIX = 'cs-snap__';
const LEGACY_FILE = 'carstory-backup.json';

// --- adapters: name-based file ops ------------------------------------------

const localDir = () => (FileSystem.documentDirectory ? `${FileSystem.documentDirectory}backups/` : null);
const WEB_PREFIX = '@autolog_bk_';

const localAdapter = {
  kind: 'local',
  async writeFile(name, contents) {
    const dir = localDir();
    if (dir) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
      await FileSystem.writeAsStringAsync(dir + name, contents);
    } else {
      await AsyncStorage.setItem(WEB_PREFIX + name, contents);
    }
    return 'local';
  },
  async readFile(name) {
    const dir = localDir();
    if (dir) {
      const info = await FileSystem.getInfoAsync(dir + name).catch(() => ({ exists: false }));
      if (!info.exists) return null;
      return FileSystem.readAsStringAsync(dir + name).catch(() => null);
    }
    return AsyncStorage.getItem(WEB_PREFIX + name);
  },
  async listFiles() {
    const dir = localDir();
    if (dir) {
      return FileSystem.readDirectoryAsync(dir).catch(() => []);
    }
    const keys = await AsyncStorage.getAllKeys().catch(() => []);
    return keys.filter((k) => k.startsWith(WEB_PREFIX)).map((k) => k.slice(WEB_PREFIX.length));
  },
  async deleteFile(name) {
    const dir = localDir();
    if (dir) {
      await FileSystem.deleteAsync(dir + name, { idempotent: true }).catch(() => {});
    } else {
      await AsyncStorage.removeItem(WEB_PREFIX + name);
    }
    return true;
  },
  async available() {
    return false;
  },
};

// iCloud adapter — present once the native module is in the build. Mirrors every
// write to local too, and falls back to local on any iCloud error.
function loadICloudAdapter() {
  try {
    if (Platform.OS !== 'ios') return null;
    const native = require('../modules/icloud-backup').default;
    if (!native || typeof native.writeFile !== 'function') return null;
    return {
      kind: 'icloud',
      async writeFile(name, contents) {
        try {
          if (await native.isAvailable()) {
            await native.writeFile(name, contents);
            await localAdapter.writeFile(name, contents); // on-device mirror
            return 'icloud';
          }
        } catch (e) {
          console.warn('iCloud write failed, using local:', e?.message);
        }
        return localAdapter.writeFile(name, contents);
      },
      async readFile(name) {
        try {
          const remote = await native.readFile(name);
          if (remote) return remote;
        } catch (e) {
          console.warn('iCloud read failed, using local:', e?.message);
        }
        return localAdapter.readFile(name);
      },
      async listFiles() {
        try {
          const names = await native.listFiles();
          if (names && names.length) return names;
        } catch (e) {
          console.warn('iCloud list failed, using local:', e?.message);
        }
        return localAdapter.listFiles();
      },
      async deleteFile(name) {
        try { await native.deleteFile(name); } catch (e) { /* ignore */ }
        return localAdapter.deleteFile(name);
      },
      async available() {
        try { return await native.isAvailable(); } catch { return false; }
      },
    };
  } catch {
    return null;
  }
}

const adapter = loadICloudAdapter() || localAdapter;

export function isICloudCapable() {
  return adapter.kind === 'icloud';
}
export async function isICloudActive() {
  return adapter.available();
}

// --- filename <-> metadata --------------------------------------------------

function sanitizeLabel(label) {
  const cleaned = (label || 'Latest')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .trim()
    .slice(0, 30)
    .replace(/\s+/g, '-');
  return cleaned || 'Latest';
}

function snapFileName({ kind, ts, count, label }) {
  if (kind === 'auto') return `${AUTO_PREFIX}${ts}__${count}.json`;
  return `${SNAP_PREFIX}${ts}__${count}__${sanitizeLabel(label)}.json`;
}

/** Parse a backup filename into { file, kind, ts, count, label } or null. */
function parseSnapFile(name) {
  if (name === LEGACY_FILE) return { file: name, kind: 'legacy', ts: 1, count: null, label: 'Backup' };
  const base = name.replace(/\.json$/, '');
  if (name.startsWith(AUTO_PREFIX)) {
    const [ts, count] = base.slice(AUTO_PREFIX.length).split('__');
    return { file: name, kind: 'auto', ts: Number(ts) || 0, count: Number(count) || 0, label: 'Auto backup' };
  }
  if (name.startsWith(SNAP_PREFIX)) {
    const parts = base.slice(SNAP_PREFIX.length).split('__');
    return {
      file: name,
      kind: 'manual',
      ts: Number(parts[0]) || 0,
      count: Number(parts[1]) || 0,
      label: (parts.slice(2).join(' ') || 'Snapshot').replace(/-/g, ' '),
    };
  }
  return null;
}

// --- public API --------------------------------------------------------------

/**
 * Complete, portable snapshot: all data plus photo bytes inlined (base64, keyed
 * by filename) so a restore on another device/install keeps the images.
 */
export async function buildBackupPayload() {
  const data = await DataUtils.exportData();
  if (data) {
    // Inline bytes for service photos (data.images[].uri) AND vehicle profile
    // pictures (data.vehicles[].photoUri), keyed by filename, so both survive a
    // restore into a new container.
    const photoRecords = [
      ...(data.images || []),
      ...(data.vehicles || []).filter((v) => v && v.photoUri).map((v) => ({ uri: v.photoUri })),
    ];
    data.imageFiles = await collectImageFiles(photoRecords);
  }
  return data;
}

/** All snapshots (auto + manual + legacy), newest first. Built from filenames. */
export async function listSnapshots() {
  let names = [];
  try { names = await adapter.listFiles(); } catch (e) { names = []; }
  return names.map(parseSnapFile).filter(Boolean).sort((a, b) => b.ts - a.ts);
}

async function writeBackup({ kind, label }) {
  const data = await buildBackupPayload();
  if (!data || (data.vehicles || []).length === 0) {
    return { success: false, reason: 'empty' };
  }
  const ts = Date.now();
  const count = (data.vehicles || []).length;
  const photoCount = Object.keys(data.imageFiles || {}).length;
  data.label = kind === 'manual' ? (label || 'Latest') : 'Auto backup';
  data.exportedAt = data.exportedAt || new Date(ts).toISOString();
  const name = snapFileName({ kind, ts, count, label: data.label });

  const location = (await adapter.writeFile(name, JSON.stringify(data))) || 'local';

  // Eviction
  const snaps = await listSnapshots();
  if (kind === 'auto') {
    // Keep only the newest auto; drop older autos and the legacy single-file.
    for (const s of snaps.filter((x) => (x.kind === 'auto' && x.file !== name) || x.kind === 'legacy')) {
      await adapter.deleteFile(s.file);
    }
  } else {
    const manuals = snaps.filter((x) => x.kind === 'manual');
    for (const s of manuals.slice(MAX_MANUAL_SNAPSHOTS)) {
      await adapter.deleteFile(s.file);
    }
  }

  await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date(ts).toISOString());
  return { success: true, at: new Date(ts).toISOString(), location, vehicleCount: count, photoCount };
}

/**
 * Create a backup. opts.kind: 'manual' (default, named, kept up to 3) or 'auto'
 * (the single rolling slot). opts.label is the manual snapshot's description.
 */
export async function backupNow(opts = {}) {
  try {
    return await writeBackup({ kind: opts.kind || 'manual', label: opts.label });
  } catch (e) {
    console.error('Backup failed:', e?.message);
    return { success: false, error: e?.message || 'Backup failed' };
  }
}

async function readAndValidate(file) {
  try {
    const raw = await adapter.readFile(file);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return DataUtils.validateImportData(data) ? data : null;
  } catch (e) {
    return null;
  }
}

export async function hasBackup() {
  return (await listSnapshots()).length > 0;
}

/**
 * Restore a specific snapshot file. Non-destructive: snapshots current data and
 * rolls back if the import throws.
 */
export async function restoreSnapshot(file) {
  try {
    const data = await readAndValidate(file);
    if (!data) return { success: false, reason: 'none' };

    let rollback = null;
    try { rollback = await DataUtils.exportData(); } catch {}

    let photoCount = 0;
    if (data.imageFiles) {
      try {
        const nameToUri = await restoreImageFiles(data.imageFiles);
        photoCount = Object.keys(nameToUri).length;
        // Repoint service photos AND vehicle profile pictures at the restored files.
        data.images = rewriteImageUris(data.images, nameToUri);
        data.vehicles = (data.vehicles || []).map((v) => {
          const name = basename(v && v.photoUri);
          return name && nameToUri[name] ? { ...v, photoUri: nameToUri[name] } : v;
        });
      } catch (e) {
        console.warn('Image restore partial/failed:', e?.message);
      }
      delete data.imageFiles;
    }

    try {
      await DataUtils.importData(data);
    } catch (e) {
      if (rollback) { try { await DataUtils.importData(rollback); } catch {} }
      throw e;
    }
    return { success: true, vehicleCount: (data.vehicles || []).length, savedAt: data.exportedAt || null, photoCount };
  } catch (e) {
    console.error('Restore failed:', e?.message);
    return { success: false, error: e?.message || 'Restore failed' };
  }
}

/** Restore the most recent snapshot (used by the launch prompt). */
export async function restoreFromBackup() {
  const snaps = await listSnapshots();
  if (!snaps.length) return { success: false, reason: 'none' };
  return restoreSnapshot(snaps[0].file);
}

export async function getBackupMeta() {
  const [lastBackupAt, autoRaw] = await Promise.all([
    AsyncStorage.getItem(LAST_BACKUP_KEY).catch(() => null),
    AsyncStorage.getItem(AUTO_BACKUP_KEY).catch(() => null),
  ]);
  const iCloud = await isICloudActive();
  return {
    lastBackupAt,
    location: iCloud ? 'icloud' : 'local',
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

// Lazy handle to the native iCloud module for its background-task helpers.
// Absent on web / Expo Go / local-only builds — callers no-op via `?.`.
function nativeBackupModule() {
  try { return require('../modules/icloud-backup').default; } catch { return null; }
}

/**
 * Auto-backup for the app-background transition (rolling single slot). Runs
 * immediately — a debounced timer often never fires once iOS suspends the JS
 * thread — and holds an iOS background task so the write completes before
 * suspension. Respects the user's auto-backup toggle.
 */
export async function runAutoBackupOnBackground() {
  if (!(await autoBackupEnabled())) return;
  const native = nativeBackupModule();
  try { await native?.beginBackgroundTask?.(); } catch {}
  try {
    await backupNow({ kind: 'auto' });
  } catch (e) {
    console.warn('Background auto-backup failed:', e?.message);
  } finally {
    try { await native?.endBackgroundTask?.(); } catch {}
  }
}

/**
 * On launch: if there's no local data but a backup exists, the caller should
 * offer to restore. Returns true when that prompt is warranted.
 */
export async function shouldOfferRestore() {
  try {
    const data = await DataUtils.exportData();
    if (data && (data.vehicles || []).length > 0) return false; // have local data
    if (await hasBackup()) return true;
    // Fresh install + iCloud: the container's file list may not have synced to
    // this device yet, so the first check can be falsely empty. Retry briefly
    // (only when iCloud is actually active) so a real backup isn't missed and
    // the user doesn't think their data is gone. No effect on local-only setups.
    if (!(await isICloudActive())) return false;
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (await hasBackup()) return true;
    }
    return false;
  } catch {
    return false;
  }
}
