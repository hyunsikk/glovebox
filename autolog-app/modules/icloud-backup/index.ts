import { requireNativeModule } from 'expo';

// Resolves the Swift module registered as Name("ICloudBackup"). Throws on
// platforms/builds where the native module isn't present (web, Expo Go, the
// pre-iCloud production build) — callers in lib/backup.js require this lazily
// inside try/catch, so a missing module simply falls back to local backup.
const Native = requireNativeModule('ICloudBackup');

/** True only when the device is signed into iCloud and the container is reachable. */
export async function isAvailable(): Promise<boolean> {
  return Native.isAvailable();
}

/** Write the backup blob into the app's iCloud Documents container. */
export async function write(contents: string): Promise<boolean> {
  return Native.write(contents);
}

/** Read the backup blob (downloading from iCloud first if needed). null if none. */
export async function read(): Promise<string | null> {
  return Native.read();
}

export default { isAvailable, write, read };
