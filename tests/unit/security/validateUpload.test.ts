import { validateUpload } from '../../../src/lib/security/validateUpload';

function makeJpeg(extraBytes = 0): Buffer {
  // Minimal valid JPEG magic bytes
  const base = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x01]);
  return Buffer.concat([base, Buffer.alloc(extraBytes)]);
}

function makePng(extraBytes = 0): Buffer {
  // PNG signature
  const base = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  return Buffer.concat([base, Buffer.alloc(extraBytes)]);
}

function makeWebP(extraBytes = 0): Buffer {
  // RIFF ????WEBP
  const base = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x00, 0x00, 0x00, 0x00, // file size (placeholder)
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
  return Buffer.concat([base, Buffer.alloc(extraBytes)]);
}

describe('validateUpload', () => {
  it('accepts a valid JPEG', () => {
    const result = validateUpload(makeJpeg());
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.error).toBeUndefined();
  });

  it('accepts a valid PNG', () => {
    const result = validateUpload(makePng());
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('image/png');
  });

  it('accepts a valid WebP', () => {
    const result = validateUpload(makeWebP());
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('image/webp');
  });

  it('rejects an unsupported file type (GIF)', () => {
    const gif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
    const result = validateUpload(gif);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported/i);
  });

  it('rejects empty buffer', () => {
    const result = validateUpload(Buffer.alloc(0));
    expect(result.valid).toBe(false);
  });

  it('rejects buffer with random bytes', () => {
    const result = validateUpload(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]));
    expect(result.valid).toBe(false);
  });

  it('rejects JPEG that exceeds 5 MB', () => {
    const fiveMbPlus = 5 * 1024 * 1024 + 1;
    const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(fiveMbPlus)]);
    const result = validateUpload(big);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5 MB/);
  });

  it('accepts JPEG exactly at 5 MB', () => {
    // 5MB total — 3 magic bytes already in header
    const fiveMb = 5 * 1024 * 1024;
    const buf = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(fiveMb - 3)]);
    expect(buf.length).toBe(fiveMb);
    const result = validateUpload(buf);
    expect(result.valid).toBe(true);
  });

  it('rejects PNG oversized', () => {
    const fiveMbPlus = 5 * 1024 * 1024 + 1;
    const big = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.alloc(fiveMbPlus),
    ]);
    const result = validateUpload(big);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5 MB/);
  });
});
