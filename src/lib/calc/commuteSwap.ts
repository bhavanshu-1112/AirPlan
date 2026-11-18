import type { CalcResult } from './types';
import type { CommuteMode } from './types';
import { COMMUTE_MULTIPLIERS } from './constants';
import { applyUncertainty } from './uncertainty';

/**
 * Compare PM2.5 exposure between two commute modes.
 * Positive result means the alternative mode saves exposure vs. the current mode.
 * exposure = ambient × multiplier × hours
 *
 * @param currentMode      - Current commute mode
 * @param alternativeMode  - Alternative mode to evaluate
 * @param commuteHours     - Daily commute duration (hours)
 * @param ambientPm25UgM3  - Ambient outdoor PM2.5 (µg/m³)
 * @returns CalcResult with exposure difference (µg/m³·h saved; positive = improvement)
 */
export function calcCommuteSwap(
  currentMode: CommuteMode,
  alternativeMode: CommuteMode,
  commuteHours: number,
  ambientPm25UgM3: number,
): CalcResult {
  // eslint-disable-next-line security/detect-object-injection
  const currentMult = (COMMUTE_MULTIPLIERS[currentMode] ?? COMMUTE_MULTIPLIERS['walk']!).value;
  // eslint-disable-next-line security/detect-object-injection
  const altMult = (COMMUTE_MULTIPLIERS[alternativeMode] ?? COMMUTE_MULTIPLIERS['walk']!).value;

  const currentExposure = ambientPm25UgM3 * currentMult * commuteHours;
  const altExposure = ambientPm25UgM3 * altMult * commuteHours;
  const central = currentExposure - altExposure; // positive = savings

  const { low, high } = applyUncertainty(Math.abs(central));
  const sign = central < 0 ? -1 : 1;

  return {
    central,
    low: sign * low,
    high: sign * high,
    formula:
      `saved = (${currentMode} − ${alternativeMode}) × ambient × hours` +
      ` = (${currentMult} − ${altMult}) × ${ambientPm25UgM3} × ${commuteHours}` +
      ` = ${central.toFixed(2)} µg/m³·h`,
    inputs: {
      ambientPm25UgM3,
      commuteHours,
      currentMultiplier: currentMult,
      alternativeMultiplier: altMult,
      currentExposure,
      alternativeExposure: altExposure,
    },
  };
}
