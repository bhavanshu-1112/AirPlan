import { POST } from '@/app/api/audit/route';
import { NextRequest } from 'next/server';
import { clearRateLimits } from '@/lib/security/rateLimit';

describe('POST /api/audit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    clearRateLimits();
    process.env = { ...originalEnv, DEMO_MODE: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function makeJpegFile(): File {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    return new File([bytes], 'room.jpg', { type: 'image/jpeg' });
  }

  function makeGifFile(): File {
    const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    return new File([bytes], 'room.gif', { type: 'image/gif' });
  }

  it('returns fixture findings for valid JPEG upload in DEMO_MODE', async () => {
    const formData = new FormData();
    formData.append('image', makeJpegFile());

    const req = new NextRequest('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.findings).toBeDefined();
    expect(Array.isArray(data.findings)).toBe(true);
    expect(data.findings.length).toBeGreaterThan(0);
  });

  it('rejects request without image file', async () => {
    const formData = new FormData();
    // No image appended

    const req = new NextRequest('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('Image file required');
  });

  it('rejects unsupported image types (e.g. GIF)', async () => {
    const formData = new FormData();
    formData.append('image', makeGifFile());

    const req = new NextRequest('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('enforces rate limits (5 requests per minute)', async () => {
    for (let i = 0; i < 5; i++) {
      const formData = new FormData();
      formData.append('image', makeJpegFile());

      const req = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '10.0.0.2',
        },
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const formData = new FormData();
    formData.append('image', makeJpegFile());

    const rateLimitedReq = new NextRequest('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '10.0.0.2',
      },
      body: formData,
    });

    const res = await POST(rateLimitedReq);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error.code).toBe('RATE_LIMIT_ERROR');
  });
});
