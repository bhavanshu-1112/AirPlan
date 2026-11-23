/**
 * Physical constants, empirical factors, and reference values for air quality calculations.
 * Every constant carries its source and whether it is an assumption vs. measured/referenced value.
 */

import type { WindowCondition, MaskType, AgeGroup, CommuteMode } from './types';

/** A typed constant with provenance metadata. */
export interface Constant {
  value: number;
  unit: string;
  source: string;
  isAssumption: boolean;
}

// ---------------------------------------------------------------------------
// Penetration & deposition
// ---------------------------------------------------------------------------

/** Fraction of outdoor PM2.5 that penetrates indoors through the building envelope. */
export const PENETRATION_FACTOR: Constant = {
  value: 0.8,
  unit: 'dimensionless',
  source: 'US EPA indoor air quality guidance',
  isAssumption: false,
};

/** Indoor particle deposition rate. */
export const DEPOSITION_RATE: Constant = {
  value: 0.2,
  unit: '1/h',
  source: 'Lai & Nazaroff (2000) modeled deposition for PM2.5',
  isAssumption: false,
};

// ---------------------------------------------------------------------------
// Air exchange rates by window condition
// ---------------------------------------------------------------------------

/** Air exchange rates (ACH) for different window/envelope conditions. */
export const AIR_EXCHANGE_RATES: Record<WindowCondition, Constant> = {
  tight: { value: 0.3, unit: '1/h', source: 'ASHRAE 62.2', isAssumption: false },
  average: { value: 0.7, unit: '1/h', source: 'ASHRAE 62.2', isAssumption: false },
  leaky: { value: 1.5, unit: '1/h', source: 'ASHRAE 62.2', isAssumption: false },
  open: {
    value: 4.0,
    unit: '1/h',
    source: 'ASHRAE 62.2 / field measurements',
    isAssumption: false,
  },
};

/** Get air exchange rate for a window condition safely without dynamic indexing. */
export function getAirExchangeRate(condition: WindowCondition): Constant {
  switch (condition) {
    case 'tight':
      return AIR_EXCHANGE_RATES.tight;
    case 'leaky':
      return AIR_EXCHANGE_RATES.leaky;
    case 'open':
      return AIR_EXCHANGE_RATES.open;
    case 'average':
    default:
      return AIR_EXCHANGE_RATES.average;
  }
}

// ---------------------------------------------------------------------------
// Mask filtration efficiencies and fit factors
// ---------------------------------------------------------------------------

/** Mask filtration efficiency (fraction of particles blocked by the filter medium). */
export const MASK_EFFICIENCIES: Record<MaskType, Constant> = {
  none: { value: 0.0, unit: 'dimensionless', source: 'N/A', isAssumption: false },
  surgical: {
    value: 0.6,
    unit: 'dimensionless',
    source: 'CDC surgical mask guidance',
    isAssumption: false,
  },
  n95: {
    value: 0.95,
    unit: 'dimensionless',
    source: 'NIOSH N95 certification standard',
    isAssumption: false,
  },
  cloth: { value: 0.3, unit: 'dimensionless', source: 'Clase et al. (2020)', isAssumption: false },
};

/** Get mask filtration efficiency safely without dynamic indexing. */
export function getMaskEfficiency(maskType: MaskType): Constant {
  switch (maskType) {
    case 'surgical':
      return MASK_EFFICIENCIES.surgical;
    case 'n95':
      return MASK_EFFICIENCIES.n95;
    case 'cloth':
      return MASK_EFFICIENCIES.cloth;
    case 'none':
    default:
      return MASK_EFFICIENCIES.none;
  }
}

/** Mask fit factor by age group (fraction of inhaled air that actually passes through filter). */
export const MASK_FIT_FACTORS: Record<AgeGroup, Constant> = {
  infant: {
    value: 0.0,
    unit: 'dimensionless',
    source: 'AAP: masks not recommended for infants',
    isAssumption: false,
  },
  child: {
    value: 0.5,
    unit: 'dimensionless',
    source: 'Assumed reduced fit for children',
    isAssumption: true,
  },
  adult: {
    value: 0.9,
    unit: 'dimensionless',
    source: 'OSHA fit-testing guidance',
    isAssumption: false,
  },
  elderly: {
    value: 0.7,
    unit: 'dimensionless',
    source: 'Assumed reduced fit for elderly',
    isAssumption: true,
  },
};

/** Get mask fit factor for an age group safely without dynamic indexing. */
export function getMaskFitFactor(ageGroup: AgeGroup): Constant {
  switch (ageGroup) {
    case 'infant':
      return MASK_FIT_FACTORS.infant;
    case 'child':
      return MASK_FIT_FACTORS.child;
    case 'elderly':
      return MASK_FIT_FACTORS.elderly;
    case 'adult':
    default:
      return MASK_FIT_FACTORS.adult;
  }
}

// ---------------------------------------------------------------------------
// Cigarette equivalence
// ---------------------------------------------------------------------------

/** Micrograms of PM2.5 inhaled per cigarette smoked. 22 µg/m³ × 24 h = 528 µg·h/m³. */
export const CIGARETTE_EQUIVALENT_UG_H_M3: Constant = {
  value: 528,
  unit: 'µg·h/m³',
  source: 'Berkeley Earth estimate: 22 µg/m³ daily average ≈ 1 cigarette/day',
  isAssumption: false,
};

// ---------------------------------------------------------------------------
// Uncertainty
// ---------------------------------------------------------------------------

/** Default uncertainty band as a fraction of the central estimate. */
export const DEFAULT_UNCERTAINTY_FRACTION: Constant = {
  value: 0.25,
  unit: 'dimensionless',
  source: 'Conservative default for PM2.5 exposure estimates',
  isAssumption: true,
};

// ---------------------------------------------------------------------------
// Indoor sources
// ---------------------------------------------------------------------------

/** PM2.5 emission rate from cooking (µg/h). */
export const COOKING_SOURCE_UG_PER_HOUR: Constant = {
  value: 300,
  unit: 'µg/h',
  source: 'He et al. (2004) residential cooking emissions',
  isAssumption: false,
};

/** PM2.5 emission rate from incense burning (µg/h). */
export const INCENSE_SOURCE_UG_PER_HOUR: Constant = {
  value: 150,
  unit: 'µg/h',
  source: 'Jetter et al. (2002) incense emission study',
  isAssumption: false,
};

// ---------------------------------------------------------------------------
// Room defaults
// ---------------------------------------------------------------------------

/** Default ceiling height in metres. */
export const DEFAULT_CEILING_HEIGHT_M: Constant = {
  value: 2.7,
  unit: 'm',
  source: 'Typical residential ceiling height',
  isAssumption: true,
};

/** Default room area in m². */
export const DEFAULT_ROOM_AREA_M2: Constant = {
  value: 20,
  unit: 'm²',
  source: 'Typical residential room',
  isAssumption: true,
};

// ---------------------------------------------------------------------------
// Commute exposure multipliers (relative to ambient walking exposure)
// ---------------------------------------------------------------------------

/** Multiplier applied to ambient PM2.5 for different commute modes. */
export const COMMUTE_MULTIPLIERS: Record<CommuteMode, Constant> = {
  car: {
    value: 0.6,
    unit: 'dimensionless',
    source: 'In-vehicle filtration studies',
    isAssumption: false,
  },
  metro: {
    value: 0.4,
    unit: 'dimensionless',
    source: 'Subway air quality studies (enclosed stations)',
    isAssumption: false,
  },
  bus: {
    value: 0.7,
    unit: 'dimensionless',
    source: 'Public transit exposure studies',
    isAssumption: false,
  },
  bicycle: {
    value: 1.2,
    unit: 'dimensionless',
    source: 'Increased ventilation rate while cycling',
    isAssumption: false,
  },
  walk: {
    value: 1.0,
    unit: 'dimensionless',
    source: 'Baseline ambient exposure',
    isAssumption: false,
  },
};

/** Get commute exposure multiplier safely without dynamic indexing. */
export function getCommuteMultiplier(mode: CommuteMode): Constant {
  switch (mode) {
    case 'car':
      return COMMUTE_MULTIPLIERS.car;
    case 'metro':
      return COMMUTE_MULTIPLIERS.metro;
    case 'bus':
      return COMMUTE_MULTIPLIERS.bus;
    case 'bicycle':
      return COMMUTE_MULTIPLIERS.bicycle;
    case 'walk':
    default:
      return COMMUTE_MULTIPLIERS.walk;
  }
}
