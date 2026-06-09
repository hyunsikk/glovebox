import { requireNativeModule } from 'expo';

// Resolves the Swift module registered as Name("ICloudBackup"). Throws on
// platforms/builds where the native module isn't present (web, Expo Go, the
// pre-iCloud production build) — callers in lib/backup.js require this lazily
// inside try/catch, so a missing module simply falls back to local backup.
const Native = requireNativeModule('ICloudBackup');

/** True only when the device is signed into iCloud and the container is reachable. */
export async function isAvailable() {
  return Native.isAvailable();
}

/** Write a named file into the app's iCloud Documents container. */
export async function writeFile(name, contents) {
  return Native.writeFile(name, contents);
}

/** Read a named file (downloading from iCloud first if needed). null if absent. */
export async function readFile(name) {
  return Native.readFile(name);
}

/** List filenames in the container (names only — no contents download needed). */
export async function listFiles() {
  return Native.listFiles();
}

/** Delete a named file from the container. */
export async function deleteFile(name) {
  return Native.deleteFile(name);
}

/** Begin an iOS background task so a background-triggered write isn't suspended mid-flight. */
export async function beginBackgroundTask() {
  return Native.beginBackgroundTask();
}

/** End the background task started by beginBackgroundTask(). */
export async function endBackgroundTask() {
  return Native.endBackgroundTask();
}

export default { isAvailable, writeFile, readFile, listFiles, deleteFile, beginBackgroundTask, endBackgroundTask };
