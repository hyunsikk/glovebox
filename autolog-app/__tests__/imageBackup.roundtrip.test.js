// Round-trip the photo-in-backup logic against an in-memory FileSystem, with no
// device. Proves: backup collects the real bytes, restore writes them into the
// new container, and records get repointed at the restored files.

const store = {}; // uri -> contents

jest.mock('../lib/imageUtils', () => ({ imagesDir: () => 'file:///NEW/images/' }));
jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64' },
  documentDirectory: 'file:///NEW/',
  getInfoAsync: jest.fn(async (uri) => ({ exists: uri in store })),
  readAsStringAsync: jest.fn(async (uri) => {
    if (!(uri in store)) throw new Error('no such file');
    return store[uri];
  }),
  writeAsStringAsync: jest.fn(async (uri, data) => { store[uri] = data; }),
  makeDirectoryAsync: jest.fn(async () => {}),
}));

import { collectImageFiles, restoreImageFiles, rewriteImageUris } from '../lib/imageBackup';

beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

test('a photo survives backup -> restore into a new app container', async () => {
  // OLD container holds the source files (paths that die on reinstall).
  store['file:///OLD/images/img_1.jpg'] = 'BYTES_1';
  store['file:///OLD/images/img_2.jpg'] = 'BYTES_2';
  const images = [
    { id: 'a', uri: 'file:///OLD/images/img_1.jpg' },
    { id: 'b', uri: 'file:///OLD/images/img_2.jpg' },
    { id: 'c', uri: 'data:image/png;base64,ZZ' }, // web record, no file
  ];

  // Backup time: bytes get pulled into the blob, keyed by filename.
  const fileMap = await collectImageFiles(images);
  expect(Object.keys(fileMap).sort()).toEqual(['img_1.jpg', 'img_2.jpg']);
  expect(fileMap['img_1.jpg']).toBe('BYTES_1');

  // Restore (new install): files written into the current container...
  const nameToUri = await restoreImageFiles(fileMap);
  expect(nameToUri['img_1.jpg']).toBe('file:///NEW/images/img_1.jpg');
  expect(store['file:///NEW/images/img_1.jpg']).toBe('BYTES_1');

  // ...and records repointed at them; the web data: URL is left alone.
  const restored = rewriteImageUris(images, nameToUri);
  expect(restored[0].uri).toBe('file:///NEW/images/img_1.jpg');
  expect(restored[1].uri).toBe('file:///NEW/images/img_2.jpg');
  expect(restored[2].uri).toBe('data:image/png;base64,ZZ');
});

test('collect skips missing files instead of throwing', async () => {
  const images = [{ id: 'a', uri: 'file:///OLD/images/gone.jpg' }];
  expect(await collectImageFiles(images)).toEqual({});
});
