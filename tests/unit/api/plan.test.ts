import { POST } from '@/app/api/plan/route';
import { NextRequest } from 'next/server';
import { clearRateLimits } from '@/lib/security/rateLimit';

describe('POST /api/plan', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    clearRateLimits();
    process.env = { ...originalEnv, DEMO_MODE: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  it('generates a plan for demo-a successfully in DEMO_MODE', async () => {
    const req = makeRequest({ householdId: 'demo-a', language: 'en' });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.householdId).toBe('demo-a');
    expect(data.topActions).toBeDefined();
    expect(data.memberPlans).toHaveLength(4);
  });

  it('generates a Hindi plan when language is hi', async () => {
    const req = makeRequest({ householdId: 'demo-a', language: 'hi' });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.language).toBe('hi');
    expect(/[\u0900-\u097F]/.test(data.disclaimer)).toBe(true);
  });

  it('returns 404 NOT_FOUND when householdId does not exist', async () => {
    const req = makeRequest({ householdId: 'non-existent-id' });
    const res = await POST(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 VALIDATION_ERROR for invalid request body', async () => {
    const req = makeRequest({ invalidKey: 123 });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('enforces rate limits (10 requests per minute)', async () => {
    for (let i = 0; i < 10; i++) {
      const req = makeRequest({ householdId: 'demo-a' }, { 'x-forwarded-for': '10.0.0.1' });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const rateLimitedReq = makeRequest({ householdId: 'demo-a' }, { 'x-forwarded-for': '10.0.0.1' });
    const res = await POST(rateLimitedReq);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error.code).toBe('RATE_LIMIT_ERROR');
  });
});
