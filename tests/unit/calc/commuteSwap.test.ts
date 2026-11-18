import { calcCommuteSwap } from '@/lib/calc/commuteSwap';

describe('calcCommuteSwap', () => {
  const ambient = 100; // µg/m³
  const hours = 1; // 1h commute

  it('car → metro saves exposure (car=0.6, metro=0.4)', () => {
    // saved = (0.6 - 0.4) × 100 × 1 = 20 µg/m³·h
    const result = calcCommuteSwap('car', 'metro', hours, ambient);
    expect(result.central).toBeCloseTo(20);
    expect(result.central).toBeGreaterThan(0);
  });

  it('same mode → zero delta', () => {
    // saved = (0.7 - 0.7) × 100 × 1 = 0
    const result = calcCommuteSwap('bus', 'bus', hours, ambient);
    expect(result.central).toBeCloseTo(0);
  });

  it('walk → bicycle loses (bicycle=1.2 > walk=1.0)', () => {
    // saved = (1.0 - 1.2) × 100 × 1 = -20 (negative = worse)
    const result = calcCommuteSwap('walk', 'bicycle', hours, ambient);
    expect(result.central).toBeCloseTo(-20);
  });

  it('formula contains mode names', () => {
    const result = calcCommuteSwap('car', 'metro', 1, 100);
    expect(result.formula).toContain('car');
    expect(result.formula).toContain('metro');
  });

  it('inputs record contains multipliers', () => {
    const result = calcCommuteSwap('car', 'walk', 1, 100);
    expect(result.inputs).toHaveProperty('currentMultiplier');
    expect(result.inputs).toHaveProperty('alternativeMultiplier');
  });

  it('proportional to commute hours', () => {
    const r1 = calcCommuteSwap('car', 'metro', 1, 100);
    const r2 = calcCommuteSwap('car', 'metro', 2, 100);
    expect(r2.central).toBeCloseTo(r1.central * 2);
  });

  it('proportional to ambient PM2.5', () => {
    const r1 = calcCommuteSwap('car', 'metro', 1, 100);
    const r2 = calcCommuteSwap('car', 'metro', 1, 200);
    expect(r2.central).toBeCloseTo(r1.central * 2);
  });
});
