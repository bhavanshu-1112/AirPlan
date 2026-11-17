import { DEFAULT_UNCERTAINTY_FRACTION } from './constants';

/**
 * Apply forecast uncertainty band to a central value.
 * Beyond 24h the band widens by an additional 10% per 12h interval.
 *
 * @param central    - Central estimate (any unit)
 * @param hoursAhead - Hours ahead in forecast; wider band beyond 24 h
 * @returns Low, high, and the band fraction used
 */
export function applyUncertainty(
  central: number,
  hoursAhead: number | undefined = undefined,
): { low: number; high: number; band: number } {
  const baseBand = DEFAULT_UNCERTAINTY_FRACTION.value; // 0.25

  let extraBand = 0;
  if (hoursAhead !== undefined && hoursAhead > 24) {
    const extra12hIntervals = Math.floor((hoursAhead - 24) / 12);
    extraBand = extra12hIntervals * 0.1;
  }

  const band = baseBand + extraBand;
  return {
    low: central * (1 - band),
    high: central * (1 + band),
    band,
  };
}
