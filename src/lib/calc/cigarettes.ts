import type { CalcResult } from './types';
import { CIGARETTE_EQUIVALENT_UG_H_M3 } from './constants';
import { applyUncertainty } from './uncertainty';

/**
 * Convert PM2.5 exposure to cigarette equivalents (rough analogy).
 * cigarettes = exposureUgM3H / CIGARETTE_EQUIVALENT_UG_H_M3
 *
 * @param exposureUgM3H - Total PM2.5 exposure (µg/m³·h)
 * @returns CalcResult with cigarette count (labeled as rough analogy)
 */
export function calcCigaretteEquivalent(exposureUgM3H: number): CalcResult {
  const equiv = CIGARETTE_EQUIVALENT_UG_H_M3.value; // 528 µg·h/m³ per cigarette
  const central = exposureUgM3H / equiv;
  const { low, high } = applyUncertainty(central);

  return {
    central,
    low,
    high,
    formula:
      `cigarettes (rough analogy) = exposure / ${equiv}` +
      ` = ${exposureUgM3H} / ${equiv}` +
      ` = ${central.toFixed(3)}`,
    inputs: { exposureUgM3H, cigaretteEquivUgHM3: equiv },
  };
}
