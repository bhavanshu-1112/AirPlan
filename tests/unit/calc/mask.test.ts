import { calcMaskEffect } from '@/lib/calc/mask';
import type { MaskType, AgeGroup } from '@/lib/calc/types';

describe('calcMaskEffect', () => {
  const ambient = 100; // µg/m³

  it('none mask: concentration unchanged for adult', () => {
    // eff=0, fit=0.9 → reduction=0 → C = 100×(1-0) = 100
    const result = calcMaskEffect(ambient, 'none', 'adult');
    expect(result.central).toBeCloseTo(100);
  });

  it('surgical mask (adult): efficiency=0.6, fit=0.9 → breathed = 100×(1-0.54)=46', () => {
    // eff=0.6, fit=0.9, reduction=0.54, C = 100×0.46 = 46
    const result = calcMaskEffect(ambient, 'surgical', 'adult');
    expect(result.central).toBeCloseTo(46, 1);
  });

  it('n95 mask (adult): efficiency=0.95, fit=0.9 → breathed = 100×(1-0.855)=14.5', () => {
    // eff=0.95, fit=0.9, reduction=0.855, C = 100×0.145 = 14.5
    const result = calcMaskEffect(ambient, 'n95', 'adult');
    expect(result.central).toBeCloseTo(14.5, 0);
  });

  it('cloth mask (adult): efficiency=0.3, fit=0.9 → breathed = 100×(1-0.27)=73', () => {
    // eff=0.3, fit=0.9, reduction=0.27, C = 100×0.73 = 73
    const result = calcMaskEffect(ambient, 'cloth', 'adult');
    expect(result.central).toBeCloseTo(73, 1);
  });

  it('infant: mask not recommended → returns ambient unchanged', () => {
    const maskTypes: MaskType[] = ['none', 'surgical', 'n95', 'cloth'];
    for (const maskType of maskTypes) {
      const result = calcMaskEffect(ambient, maskType, 'infant');
      expect(result.central).toBeCloseTo(ambient);
      expect(result.formula).toContain('infant');
    }
  });

  it('property: better mask ≤ worse mask exposure (for adult)', () => {
    const none = calcMaskEffect(ambient, 'none', 'adult');
    const cloth = calcMaskEffect(ambient, 'cloth', 'adult');
    const surgical = calcMaskEffect(ambient, 'surgical', 'adult');
    const n95 = calcMaskEffect(ambient, 'n95', 'adult');
    expect(cloth.central).toBeLessThanOrEqual(none.central);
    expect(surgical.central).toBeLessThanOrEqual(cloth.central);
    expect(n95.central).toBeLessThanOrEqual(surgical.central);
  });

  it('zero ambient: all masks return 0', () => {
    const result = calcMaskEffect(0, 'n95', 'adult');
    expect(result.central).toBe(0);
  });

  it('low ≤ central ≤ high', () => {
    const result = calcMaskEffect(80, 'surgical', 'adult');
    expect(result.low).toBeLessThanOrEqual(result.central);
    expect(result.high).toBeGreaterThanOrEqual(result.central);
  });

  it('child gets lower fit factor than adult (same mask)', () => {
    const child = calcMaskEffect(100, 'n95', 'child');
    const adult = calcMaskEffect(100, 'n95', 'adult');
    // child fit=0.5 → lower benefit → more breathed
    expect(child.central).toBeGreaterThan(adult.central);
  });
});
