/**
 * Core types for the AirPlan calculation layer.
 * All calculations return CalcResult with central estimate plus uncertainty band.
 */

/** Result of a calculation with central estimate, uncertainty band, and audit trail. */
export interface CalcResult {
  /** Central (best) estimate */
  central: number;
  /** Lower bound of uncertainty band */
  low: number;
  /** Upper bound of uncertainty band */
  high: number;
  /** Human-readable formula with substituted values */
  formula: string;
  /** Named numeric inputs that were used */
  inputs: Record<string, number>;
}

/** How well-sealed the windows are — determines air exchange rate. */
export type WindowCondition = 'tight' | 'average' | 'leaky' | 'open';

/** Type of mask worn. */
export type MaskType = 'none' | 'surgical' | 'n95' | 'cloth';

/** Age group — affects mask fit and feasibility. */
export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';

/** Mode of transportation for commute exposure comparison. */
export type CommuteMode = 'car' | 'metro' | 'bus' | 'bicycle' | 'walk';
