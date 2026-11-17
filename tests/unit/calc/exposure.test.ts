import { calcExposure } from '@/lib/calc/exposure';

describe('calcExposure', () => {
  it('example 1: single hour at 50 µg/m³ × 1h = 50', () => {
    // E = 50 × 1.0 = 50 µg/m³·h
    const result = calcExposure([50]);
    expect(result.central).toBeCloseTo(50);
    expect(result.low).toBeCloseTo(37.5);  // 50 × 0.75
    expect(result.high).toBeCloseTo(62.5); // 50 × 1.25
  });

  it('example 2: three equal hours at 100 µg/m³ = 300', () => {
    // E = 100×1 + 100×1 + 100×1 = 300 µg/m³·h
    const result = calcExposure([100, 100, 100]);
    expect(result.central).toBeCloseTo(300);
    expect(result.low).toBeCloseTo(225);  // 300 × 0.75
    expect(result.high).toBeCloseTo(375); // 300 × 1.25
  });

  it('example 3: variable hours — 60 µg/m³ × 0.5h + 80 µg/m³ × 1.5h = 150', () => {
    // E = 60×0.5 + 80×1.5 = 30 + 120 = 150 µg/m³·h
    const result = calcExposure([60, 80], [0.5, 1.5]);
    expect(result.central).toBeCloseTo(150);
  });

  it('zero concentration produces zero exposure', () => {
    const result = calcExposure([0, 0, 0]);
    expect(result.central).toBe(0);
    expect(result.low).toBe(0);
    expect(result.high).toBe(0);
  });

  it('empty array produces zero', () => {
    const result = calcExposure([]);
    expect(result.central).toBe(0);
  });

  it('formula string contains the total', () => {
    const result = calcExposure([50]);
    expect(result.formula).toContain('50.00');
  });

  it('low ≤ central ≤ high for any input', () => {
    const inputs = [
      [10, 20, 30, 40, 50],
      [0],
      [1000],
    ];
    for (const arr of inputs) {
      const r = calcExposure(arr);
      expect(r.low).toBeLessThanOrEqual(r.central);
      expect(r.high).toBeGreaterThanOrEqual(r.central);
    }
  });
});
