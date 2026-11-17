import { calcCigaretteEquivalent } from '@/lib/calc/cigarettes';

const EQUIV = 528; // µg·h/m³ per cigarette

describe('calcCigaretteEquivalent', () => {
  it('example 1: exactly one cigarette equivalence at 528 µg·h/m³', () => {
    // cigarettes = 528 / 528 = 1
    const result = calcCigaretteEquivalent(EQUIV);
    expect(result.central).toBeCloseTo(1);
  });

  it('example 2: half a cigarette at 264 µg·h/m³', () => {
    // cigarettes = 264 / 528 = 0.5
    const result = calcCigaretteEquivalent(264);
    expect(result.central).toBeCloseTo(0.5);
  });

  it('example 3: 10 cigarettes at 5280 µg·h/m³', () => {
    // cigarettes = 5280 / 528 = 10
    const result = calcCigaretteEquivalent(5280);
    expect(result.central).toBeCloseTo(10);
  });

  it('round-trip: calcExposure result → cigarettes → back to exposure', () => {
    const exposure = 1056; // 2 cigarettes
    const result = calcCigaretteEquivalent(exposure);
    expect(result.central * EQUIV).toBeCloseTo(exposure);
  });

  it('zero exposure → zero cigarettes', () => {
    const result = calcCigaretteEquivalent(0);
    expect(result.central).toBe(0);
    expect(result.low).toBe(0);
    expect(result.high).toBe(0);
  });

  it('formula contains "rough analogy"', () => {
    const result = calcCigaretteEquivalent(528);
    expect(result.formula).toContain('rough analogy');
  });

  it('low ≤ central ≤ high', () => {
    const result = calcCigaretteEquivalent(2000);
    expect(result.low).toBeLessThanOrEqual(result.central);
    expect(result.high).toBeGreaterThanOrEqual(result.central);
  });
});
