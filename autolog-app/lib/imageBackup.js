/**
 * Make backups carry the actual photo bytes, not just file paths.
 *
 * Image records store an absolute uri under the app's documentDirectory. That
 * path is useless after a reinstall (iOS rotates the container UUID) or on a new
 * device, so a metadata-only backup would restore everything except broken
 * photos. Here we inline each image file as base64 keyed by filename at backup
 * time, and on restore write the files back into the *current* container and
 * rewrite each record's uri to match.
 *
 * Pure helpers (basename, rewriteImageUris) carry no FileSystem dependency so
 * they're unit-tested; the I/O helpers wrap them.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { imagesDir } from './imageUtils';

/** Last path segment of a uri/path, ignoring query/fragment. null if none. */
export function basename(uri) {
  if (!uri || typeof uri !== 'string') return null;
  const clean = uri.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const seg = clean.substring(clean.lastIndexOf('/') + 1);
  return seg || null;
}

/** True for a local file we should inline (skip web data: URLs and remote http). */
export function isLocalFileUri(uri) {
  return typeof uri === 'string' && (uri.startsWith('file:') || uri.startsWith('/'));
}

/**
 * Return a copy of `images` with each record's uri repointed to nameToUri[name]
 * when its filename matches one we restored. Records we have no file for are
 * left untouched.
 */
export function rewriteImageUris(images, nameToUri) {
  if (!Array.isArray(images)) return images;
  return images.map((img) => {
    const name = basename(img && img.uri);
    if (name && nameToUri[name]) return { ...img, uri: nameToUri[name] };
    return img;
  });
}

/**
 * Read every local image file referenced by `images` into a { filename: base64 }
 * map. Missing files and non-file uris are skipped silently.
 */
export async function collectImageFiles(images) {
  const out = {};
  if (!Array.isArray(images)) return out;
  for (const img of images) {
    const uri = img && img.uri;
    const name = basename(uri);
    if (!name || !isLocalFileUri(uri)) continue;
    try {
      const info = await FileSystem.getInfoAsync(uri).catch(() => ({ exists: false }));
      if (!info.exists) continue;
      out[name] = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    } catch (e) {
      // A single unreadable image must not abort the whole backup.
      console.warn('Skipping unreadable image in backup:', name, e?.message);
    }
  }
  return out;
}

/**
 * Write a { filename: base64 } map back into the current images directory.
 * Returns { filename: absoluteUri } for rewriting the restored records.
 */
export async function restoreImageFiles(fileMap) {
  const nameToUri = {};
  if (!fileMap || typeof fileMap !== 'object' || !FileSystem.documentDirectory) return nameToUri;
  const dir = imagesDir();
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  for (const [name, base64] of Object.entries(fileMap)) {
    try {
      const dest = `${dir}${name}`;
      await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
      nameToUri[name] = dest;
    } catch (e) {
      console.warn('Failed to restore image file:', name, e?.message);
    }
  }
  return nameToUri;
}
