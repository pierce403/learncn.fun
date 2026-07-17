import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";

const previewImage = readFileSync(new URL("../public/og-preview-v1.png", import.meta.url));

function readUint32BigEndian(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 2 ** 24 +
    bytes[offset + 1] * 2 ** 16 +
    bytes[offset + 2] * 2 ** 8 +
    bytes[offset + 3]
  );
}

describe("social preview metadata", () => {
  it("publishes canonical Open Graph and Twitter card URLs", () => {
    expect(indexHtml).toContain('<link rel="canonical" href="https://learncn.fun/"');
    expect(indexHtml).toContain('property="og:type" content="website"');
    expect(indexHtml).toContain('property="og:url" content="https://learncn.fun/"');
    expect(indexHtml).toContain(
      'property="og:image" content="https://learncn.fun/og-preview-v1.png"',
    );
    expect(indexHtml).toContain('property="og:image:width" content="1200"');
    expect(indexHtml).toContain('property="og:image:height" content="630"');
    expect(indexHtml).toContain('name="twitter:card" content="summary_large_image"');
    expect(indexHtml).toContain(
      'name="twitter:image" content="https://learncn.fun/og-preview-v1.png"',
    );
  });

  it("publishes a valid 1200 by 630 PNG with meaningful alt text", () => {
    expect(indexHtml).toContain('property="og:image:type" content="image/png"');
    expect(indexHtml).toContain(
      'content="learncn.fun Chinese character practice, with a lamb climbing six study cards toward a mountain"',
    );
    expect(String.fromCharCode(...previewImage.subarray(1, 4))).toBe("PNG");
    expect(readUint32BigEndian(previewImage, 16)).toBe(1200);
    expect(readUint32BigEndian(previewImage, 20)).toBe(630);
    expect(previewImage.byteLength).toBeLessThan(2_000_000);
  });
});
