import { calcIndoorConcentration } from '@/lib/calc/indoor';

describe('calcIndoorConcentration', () => {
  // C_in = (P×a×C_out + S/V) / (a + k + CADR/V)
  // P=0.8, k=0.2, V=20×2.7=54 m³ for defaults

  it('no purifier, no source, tight windows', () => {
    // a=0.3, V=54, S=0
    // C_in = (0.8×0.3×100) / (0.3 + 0.2 + 0) = 24 / 0.5 = 48
    const result = calcIndoorConcentration(100, 'tight');
    expect(result.central).toBeCloseTo(48, 1);
    expect(result.low).toBeLessThan(result.central);
    expect(result.high).toBeGreaterThan(result.central);
  });

  it('with purifier (CADR=100), no source, average windows', () => {
    // a=0.7, V=54, CADR=100
    // numerator = 0.8×0.7×100 = 56
    // denominator = 0.7 + 0.2 + 100/54 ≈ 0.9 + 1.852 = 2.752
    // C_in ≈ 56 / 2.752 ≈ 20.35
    const result = calcIndoorConcentration(100, 'average', 100);
    expect(result.central).toBeCloseTo(20.35, 0);
  });

  it('purifier reduces indoor concentration vs no purifier', () => {
    const noPurifier = calcIndoorConcentration(80, 'average', 0);
    const withPurifier = calcIndoorConcentration(80, 'average', 200);
    expect(withPurifier.central).toBeLessThan(noPurifier.central);
  });

  it('with cooking source (300 µg/h), leaky windows', () => {
    // a=1.5, V=54, S=300
    // numerator = 0.8×1.5×50 + 300/54 = 60 + 5.556 = 65.556
    // denominator = 1.5 + 0.2 + 0 = 1.7
    // C_in ≈ 38.56
    const result = calcIndoorConcentration(50, 'leaky', 0, undefined, undefined, 300);
    expect(result.central).toBeGreaterThan(calcIndoorConcentration(50, 'leaky', 0).central);
  });

  it('zero outdoor PM2.5, no source → near zero indoor', () => {
    const result = calcIndoorConcentration(0, 'average', 0, 20, 2.7, 0);
    expect(result.central).toBeCloseTo(0);
  });

  it('formula string is included', () => {
    const result = calcIndoorConcentration(50, 'tight');
    expect(result.formula).toContain('C_in');
  });

  it('inputs record contains key fields', () => {
    const result = calcIndoorConcentration(50, 'average');
    expect(result.inputs).toHaveProperty('outdoorPm25UgM3', 50);
  });

  it('low ≤ central ≤ high', () => {
    const result = calcIndoorConcentration(120, 'open', 150);
    expect(result.low).toBeLessThanOrEqual(result.central);
    expect(result.high).toBeGreaterThanOrEqual(result.central);
  });
});
