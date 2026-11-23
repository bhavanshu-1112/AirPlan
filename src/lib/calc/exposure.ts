import type { CalcResult } from './types';
import { applyUncertainty } from './uncertainty';

/**
 * Calculate total PM2.5 exposure over one or more time slots.
 * E = Σ (C_h × t_h)
 *
 * @param hourlyConcentrationsUgM3 - PM2.5 concentration for each slot (µg/m³)
 * @param hoursPerSlot             - Duration of each slot (h); defaults to 1.0 each
 * @returns CalcResult with cumulative exposure in µg/m³·h
 */
export function calcExposure(
  hourlyConcentrationsUgM3: number[],
  hoursPerSlot: number[] | undefined = undefined,
): CalcResult {
  const slots = hourlyConcentrationsUgM3.length;
  let total = 0;
  const termStrings: string[] = [];

  for (let i = 0; i < slots; i++) {
    const c = hourlyConcentrationsUgM3.at(i) ?? 0;
    const t = hoursPerSlot !== undefined ? (hoursPerSlot.at(i) ?? 1.0) : 1.0;
    total += c * t;
    termStrings.push(`${c.toFixed(1)}×${t.toFixed(1)}`);
  }

  const { low, high } = applyUncertainty(total);

  return {
    central: total,
    low,
    high,
    formula: `E = ${termStrings.join(' + ')} = ${total.toFixed(2)} µg/m³·h`,
    inputs: { slots, total },
  };
}
