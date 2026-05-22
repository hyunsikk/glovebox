jest.mock('expo-file-system', () => ({}), { virtual: true });
jest.mock('../lib/imageUtils', () => ({ imagesDir: () => 'file:///docs/images/' }), { virtual: true });

import { basename, isLocalFileUri, rewriteImageUris } from '../lib/imageBackup';

describe('imageBackup pure helpers', () => {
  test('basename extracts filename and ignores query/fragment', () => {
    expect(basename('file:///var/app/ABC/Documents/images/img_1.jpg')).toBe('img_1.jpg');
    expect(basename('file:///images/img_2.png?x=1#y')).toBe('img_2.png');
    expect(basename(null)).toBeNull();
    expect(basename('')).toBeNull();
  });

  test('isLocalFileUri only matches local files', () => {
    expect(isLocalFileUri('file:///images/a.jpg')).toBe(true);
    expect(isLocalFileUri('/images/a.jpg')).toBe(true);
    expect(isLocalFileUri('data:image/png;base64,AAAA')).toBe(false);
    expect(isLocalFileUri('https://x/y.jpg')).toBe(false);
  });

  test('rewriteImageUris repoints matching filenames to the restored uri', () => {
    const images = [
      { id: 'a', uri: 'file:///old/container/images/img_1.jpg' },
      { id: 'b', uri: 'file:///old/container/images/img_2.jpg' },
      { id: 'c', uri: 'data:image/png;base64,ZZ' }, // web record, untouched
    ];
    const nameToUri = { 'img_1.jpg': 'file:///new/container/images/img_1.jpg' };
    const out = rewriteImageUris(images, nameToUri);
    expect(out[0].uri).toBe('file:///new/container/images/img_1.jpg');
    expect(out[1].uri).toBe('file:///old/container/images/img_2.jpg'); // no file for it
    expect(out[2].uri).toBe('data:image/png;base64,ZZ');
  });
});
