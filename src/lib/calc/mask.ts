import type { CalcResult } from './types';
import type { MaskType, AgeGroup } from './types';
import { MASK_EFFICIENCIES, MASK_FIT_FACTORS } from './constants';
import { applyUncertainty } from './uncertainty';

/**
 * Calculate effective PM2.5 concentration after mask filtration.
 * C_breathed = C_ambient × (1 - efficiency × fitFactor)
 * Infants receive no mask benefit (masks are not recommended for infants).
 *
 * @param ambientPm25UgM3 - Ambient PM2.5 (µg/m³)
 * @param maskType        - Type of mask worn
 * @param ageGroup        - Wearer's age group
 * @returns CalcResult with breathed PM2.5 concentration (µg/m³)
 */
export function calcMaskEffect(
  ambientPm25UgM3: number,
  maskType: MaskType,
  ageGroup: AgeGroup,
): CalcResult {
  if (ageGroup === 'infant') {
    const { low, high } = applyUncertainty(ambientPm25UgM3);
    return {
      central: ambientPm25UgM3,
      low,
      high,
      formula: `C_breathed = ${ambientPm25UgM3} µg/m³ (masks not recommended for infants)`,
      inputs: { ambientPm25UgM3, efficiency: 0, fitFactor: 0 },
    };
  }

  const efficiency = (MASK_EFFICIENCIES[maskType] ?? MASK_EFFICIENCIES['none']!).value;
  const fitFactor = (MASK_FIT_FACTORS[ageGroup] ?? MASK_FIT_FACTORS['adult']!).value;
  const reduction = efficiency * fitFactor;
  const central = ambientPm25UgM3 * (1 - reduction);

  const { low, high } = applyUncertainty(central);

  return {
    central,
    low,
    high,
    formula:
      `C_breathed = C × (1 - eff × fit)` +
      ` = ${ambientPm25UgM3} × (1 - ${efficiency} × ${fitFactor})` +
      ` = ${central.toFixed(2)} µg/m³`,
    inputs: { ambientPm25UgM3, efficiency, fitFactor, reduction },
  };
}
