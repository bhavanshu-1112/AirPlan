import { applyUncertainty } from '@/lib/calc/uncertainty';

describe('applyUncertainty', () => {
  it('default band is ±25% of central', () => {
    const result = applyUncertainty(100);
    expect(result.band).toBeCloseTo(0.25);
    expect(result.low).toBeCloseTo(75);
    expect(result.high).toBeCloseTo(125);
  });

  it('no extra band for ≤24h ahead', () => {
    const result = applyUncertainty(100, 24);
    expect(result.band).toBeCloseTo(0.25);
  });

  it('widens by 10% per 12h beyond 24h', () => {
    // 36h = 24h + 1×12h → band = 0.25 + 0.10 = 0.35
    const result = applyUncertainty(100, 36);
    expect(result.band).toBeCloseTo(0.35);
    expect(result.low).toBeCloseTo(65);
    expect(result.high).toBeCloseTo(135);
  });

  it('48h = 24 + 2×12h → band = 0.45', () => {
    const result = applyUncertainty(200, 48);
    expect(result.band).toBeCloseTo(0.45);
    expect(result.low).toBeCloseTo(110);
    expect(result.high).toBeCloseTo(290);
  });

  it('property: low ≤ central ≤ high for any input', () => {
    const centrals = [0, 1, 50, 1000];
    const hours = [0, 12, 24, 36, 72];
    for (const c of centrals) {
      for (const h of hours) {
        const r = applyUncertainty(c, h);
        expect(r.low).toBeLessThanOrEqual(c);
        expect(r.high).toBeGreaterThanOrEqual(c);
      }
    }
  });

  it('zero central → low=0, high=0', () => {
    const result = applyUncertainty(0);
    expect(result.low).toBe(0);
    expect(result.high).toBe(0);
  });

  it('no hoursAhead argument → default 25% band', () => {
    const r = applyUncertainty(80);
    expect(r.band).toBeCloseTo(0.25);
  });
});
