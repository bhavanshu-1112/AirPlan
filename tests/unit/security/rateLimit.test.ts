import { checkRateLimit, clearRateLimits } from '../../../src/lib/security/rateLimit';

beforeEach(() => {
  clearRateLimits();
});

describe('checkRateLimit', () => {
  it('allows first request and returns remaining = limit - 1', () => {
    const result = checkRateLimit('user1', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('allows up to the limit', () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit('user2', 10, 60_000);
      expect(r.allowed).toBe(true);
    }
  });

  it('blocks after limit is reached', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('user3', 10, 60_000);
    }
    const r = checkRateLimit('user3', 10, 60_000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('tracks remaining count correctly', () => {
    checkRateLimit('user4', 5, 60_000); // 1st — remaining 4
    checkRateLimit('user4', 5, 60_000); // 2nd — remaining 3
    const r = checkRateLimit('user4', 5, 60_000); // 3rd — remaining 2
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it('provides a future resetAt timestamp', () => {
    const before = Date.now();
    const r = checkRateLimit('user5', 10, 60_000);
    expect(r.resetAt).toBeGreaterThan(before);
    expect(r.resetAt).toBeLessThanOrEqual(before + 60_000 + 10);
  });

  it('resets window after expiry', () => {
    // Use a very short window
    checkRateLimit('user6', 1, 1); // hit the limit immediately
    checkRateLimit('user6', 1, 1); // should be blocked (count=1 >= limit=1)

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const r = checkRateLimit('user6', 1, 1);
        expect(r.allowed).toBe(true);
        resolve();
      }, 20);
    });
  });

  it('different keys are independent', () => {
    for (let i = 0; i < 10; i++) checkRateLimit('keyA', 10, 60_000);
    // keyA is now exhausted, keyB should still be fresh
    const r = checkRateLimit('keyB', 10, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9);
  });

  it('uses default limit of 10', () => {
    for (let i = 0; i < 10; i++) checkRateLimit('userDefault');
    const r = checkRateLimit('userDefault');
    expect(r.allowed).toBe(false);
  });
});
