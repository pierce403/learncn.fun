import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import index from '../index.html?raw';
import penguin from '../1c/index.html?raw';
import manifestSource from '../public/manifest.webmanifest?raw';

function dimension(bytes: Uint8Array, offset: number) {
  return bytes[offset] * 2 ** 24 + bytes[offset + 1] * 2 ** 16 + bytes[offset + 2] * 256 + bytes[offset + 3];
}
describe('installable app metadata', () => {
  it('uses one app identity across the main site and penguin lessons', () => {
    const manifest = JSON.parse(manifestSource);
    expect(manifest.id).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.name).toContain('learncn.fun');
    expect(manifest.prefer_related_applications).toBe(false);
    expect(manifest.shortcuts[0].url).toBe('/1c/');
    for (const html of [index, penguin]) {
      expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
      expect(html).toContain('rel="apple-touch-icon" href="/icons/app-180.png"');
    }
  });
  it('ships correctly sized PNG icons for Android and Apple home screens', () => {
    const manifest = JSON.parse(manifestSource);
    expect(manifest.icons.map((icon: {sizes: string}) => icon.sizes)).toEqual(['192x192','512x512']);
    for (const size of [192,512,180]) {
      const bytes = readFileSync(new URL(`../public/icons/app-${size}.png`, import.meta.url));
      expect(String.fromCharCode(...bytes.subarray(1,4))).toBe('PNG');
      expect(dimension(bytes,16)).toBe(size);
      expect(dimension(bytes,20)).toBe(size);
    }
  });
});
