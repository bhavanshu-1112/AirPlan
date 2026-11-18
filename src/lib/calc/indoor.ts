import type { CalcResult } from './types';
import type { WindowCondition } from './types';
import {
  PENETRATION_FACTOR,
  AIR_EXCHANGE_RATES,
  DEPOSITION_RATE,
  DEFAULT_ROOM_AREA_M2,
  DEFAULT_CEILING_HEIGHT_M,
} from './constants';
import { applyUncertainty } from './uncertainty';

/**
 * Calculate steady-state indoor PM2.5 concentration using a mass-balance model.
 * C_in = (P × a × C_out + S/V) / (a + k + CADR/V)
 *
 * @param outdoorPm25UgM3        - Outdoor PM2.5 (µg/m³)
 * @param windowCondition        - Window/envelope seal quality
 * @param cadrM3PerHour          - Air purifier CADR (m³/h); 0 = no purifier
 * @param roomAreaM2             - Room floor area (m²); default 20
 * @param ceilingHeightM         - Ceiling height (m); default 2.7
 * @param indoorSourceUgPerHour  - Indoor PM2.5 emission rate (µg/h); default 0
 * @returns CalcResult with indoor PM2.5 concentration (µg/m³)
 */
export function calcIndoorConcentration(
  outdoorPm25UgM3: number,
  windowCondition: WindowCondition,
  cadrM3PerHour: number | undefined = undefined,
  roomAreaM2: number | undefined = undefined,
  ceilingHeightM: number | undefined = undefined,
  indoorSourceUgPerHour: number | undefined = undefined,
): CalcResult {
  const area = roomAreaM2 ?? DEFAULT_ROOM_AREA_M2.value;
  const height = ceilingHeightM ?? DEFAULT_CEILING_HEIGHT_M.value;
  const source = indoorSourceUgPerHour ?? 0;
  const cadr = cadrM3PerHour ?? 0;

  const V = area * height; // room volume m³
  const P = PENETRATION_FACTOR.value; // 0.8
  // eslint-disable-next-line security/detect-object-injection
  const a = (AIR_EXCHANGE_RATES[windowCondition] ?? AIR_EXCHANGE_RATES['average']!).value;
  const k = DEPOSITION_RATE.value; // 0.2

  const numerator = P * a * outdoorPm25UgM3 + source / V;
  const denominator = a + k + cadr / V;
  const central = numerator / denominator;

  const { low, high } = applyUncertainty(central);

  return {
    central,
    low,
    high,
    formula:
      `C_in = (P×a×C_out + S/V) / (a + k + CADR/V)` +
      ` = (${P}×${a}×${outdoorPm25UgM3} + ${source}/${V.toFixed(1)}) / (${a} + ${k} + ${cadr}/${V.toFixed(1)})` +
      ` = ${central.toFixed(2)} µg/m³`,
    inputs: {
      outdoorPm25UgM3,
      cadrM3PerHour: cadr,
      roomAreaM2: area,
      ceilingHeightM: height,
      indoorSourceUgPerHour: source,
      volumeM3: V,
      a,
      P,
      k,
    },
  };
}
