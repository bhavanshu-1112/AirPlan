import { PlanSchema } from '@/lib/schemas/plan';
import type { Plan, Recommendation } from '@/lib/schemas/plan';
import type { Household, Member } from '@/lib/schemas/household';
import type { ForecastResponse } from '@/lib/schemas/forecast';
import { calcExposure } from '@/lib/calc/exposure';
import { calcMaskEffect } from '@/lib/calc/mask';
import { calcVentilationWindows } from '@/lib/calc/ventilation';
import { calcIndoorConcentration } from '@/lib/calc/indoor';
import { calcCommuteSwap } from '@/lib/calc/commuteSwap';
import { calcCigaretteEquivalent } from '@/lib/calc/cigarettes';
import { getAqiCategory } from '@/lib/calc/aqi';
import type {
  CalcResult,
  WindowCondition,
  MaskType,
  AgeGroup,
  CommuteMode,
} from '@/lib/calc/types';

const MAX_TOOL_ITERATIONS = 6;

/** Execute a calc tool by name. */
function executeTool(name: string, args: Record<string, unknown>): CalcResult | unknown {
  switch (name) {
    case 'calc_exposure':
      return calcExposure(
        args['hourlyConcentrations'] as number[],
        args['hoursPerSlot'] as number[] | undefined,
      );
    case 'calc_mask_effect':
      return calcMaskEffect(
        args['ambientPm25'] as number,
        args['maskType'] as MaskType,
        args['ageGroup'] as AgeGroup,
      );
    case 'calc_ventilation_windows':
      return calcVentilationWindows(
        args['hourlyOutdoorPm25'] as number[],
        args['indoorPm25Closed'] as number,
      );
    case 'calc_indoor_concentration':
      return calcIndoorConcentration(
        args['outdoorPm25'] as number,
        args['windowCondition'] as WindowCondition,
        args['cadrM3PerHour'] as number | undefined,
        args['roomAreaM2'] as number | undefined,
        undefined,
        args['indoorSourceUgPerHour'] as number | undefined,
      );
    case 'calc_commute_swap':
      return calcCommuteSwap(
        args['currentMode'] as CommuteMode,
        args['alternativeMode'] as CommuteMode,
        args['commuteHours'] as number,
        args['ambientPm25'] as number,
      );
    case 'calc_cigarette_equivalent':
      return calcCigaretteEquivalent(args['exposureUgM3H'] as number);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Generate a plan. In DEMO_MODE returns a deterministic plan from real calc functions.
 */
export async function generatePlan(
  household: Household,
  forecast: ForecastResponse,
  language: 'en' | 'hi' = 'en',
): Promise<Plan> {
  return buildDemoPlan(household, forecast, language);
}

interface ForecastSummary {
  pm25: number[];
  avgPm25: number;
  minMidday: number;
  aqiCat: ReturnType<typeof getAqiCategory>;
}

function summarizeForecast(forecast: ForecastResponse): ForecastSummary {
  const pm25 = forecast.hourly.pm2_5;
  const avgPm25 = pm25.reduce((s, v) => s + v, 0) / pm25.length;
  const minMidday = Math.min(...pm25.slice(10, 15));
  const aqiAvg = forecast.hourly.us_aqi.reduce((s, v) => s + v, 0) / forecast.hourly.us_aqi.length;
  const aqiCat = getAqiCategory(aqiAvg);
  return { pm25, avgPm25, minMidday, aqiCat };
}

type VentWindow = { startHour: number; endHour: number; avgPm25: number };

function buildTimingAction(
  household: Household,
  fs: ForecastSummary,
  baseExp: CalcResult,
  isHi: boolean,
): Recommendation {
  return {
    action: isHi ? 'दोपहर 11-2 बजे बाहर जाएं' : 'Go outdoors during 11 AM - 2 PM window',
    reason: isHi ? 'इस समय प्रदूषण सबसे कम है' : 'PM2.5 levels are lowest during midday dip',
    impactCard: {
      title: 'Outdoor timing optimization',
      beforeExposure: fs.avgPm25 * 3,
      afterExposure: fs.minMidday * 3,
      exposureSaved: (fs.avgPm25 - fs.minMidday) * 3,
      cigaretteEquivalentSaved: ((fs.avgPm25 - fs.minMidday) * 3) / 528,
      formula: baseExp.formula,
      inputs: baseExp.inputs,
      range: { low: baseExp.low, central: baseExp.central, high: baseExp.high },
      dataSourceLabel: 'Open-Meteo forecast + calc layer',
    },
    memberNames: household.members.map((m) => m.name),
  };
}

function buildMaskAction(household: Household, fs: ForecastSummary, isHi: boolean): Recommendation {
  return {
    action: isHi ? 'बाहर N95 मास्क पहनें' : 'Wear N95 mask during outdoor activities',
    reason: isHi ? 'PM2.5 को 76% तक कम करता है' : 'Reduces PM2.5 exposure by up to 76%',
    impactCard: {
      title: 'Mask protection',
      beforeExposure: fs.avgPm25,
      afterExposure: fs.avgPm25 * 0.24,
      exposureSaved: fs.avgPm25 * 0.76,
      cigaretteEquivalentSaved: (fs.avgPm25 * 0.76) / 528,
      formula: `C_breathed = ${fs.avgPm25.toFixed(0)} × (1 - 0.95 × 0.8) = ${(fs.avgPm25 * 0.24).toFixed(1)} µg/m³`,
      inputs: { ambientPm25: fs.avgPm25, efficiency: 0.95, fitFactor: 0.8 },
      range: {
        low: fs.avgPm25 * 0.24 * 0.75,
        central: fs.avgPm25 * 0.24,
        high: fs.avgPm25 * 0.24 * 1.25,
      },
      dataSourceLabel: 'NIOSH N95 standards + calc layer',
    },
    memberNames: household.members.filter((m) => m.ageGroup !== 'infant').map((m) => m.name),
  };
}

function buildVentAction(
  household: Household,
  indoorResult: CalcResult,
  ventWindows: VentWindow[],
  isHi: boolean,
): Recommendation {
  const hasVent = ventWindows.length > 0;
  const ventAction = hasVent
    ? isHi
      ? `${ventWindows[0]!.startHour}:00 बजे खिड़कियां खोलें`
      : `Open windows at ${ventWindows[0]!.startHour}:00 for ventilation`
    : isHi
      ? 'आज खिड़कियां बंद रखें'
      : 'Keep windows closed today';
  const ventSaved = hasVent ? indoorResult.central - ventWindows[0]!.avgPm25 : 0;
  const ventAfter = hasVent ? ventWindows[0]!.avgPm25 : indoorResult.central;

  return {
    action: ventAction,
    reason: isHi
      ? 'बाहरी हवा अंदर से साफ़ है इस समय'
      : 'Outdoor air is cleaner than indoor during this window',
    impactCard: {
      title: 'Ventilation optimization',
      beforeExposure: indoorResult.central,
      afterExposure: ventAfter,
      exposureSaved: ventSaved,
      cigaretteEquivalentSaved: ventSaved / 528,
      formula: indoorResult.formula,
      inputs: indoorResult.inputs,
      range: { low: indoorResult.low, central: indoorResult.central, high: indoorResult.high },
      dataSourceLabel: 'Mass-balance indoor model + Open-Meteo',
    },
    memberNames: household.members.map((m) => m.name),
  };
}

function buildMemberPlan(
  member: Member,
  household: Household,
  avgPm25: number,
  ventWindows: VentWindow[],
  isHi: boolean,
) {
  const maskR = calcMaskEffect(
    avgPm25,
    household.maskAvailability as MaskType,
    member.ageGroup as AgeGroup,
  );
  const maskRec =
    member.ageGroup === 'infant'
      ? isHi
        ? 'शिशुओं के लिए मास्क अनुशंसित नहीं (सुरक्षा जोखिम)'
        : 'No mask recommended for infants (safety risk)'
      : isHi
        ? `बाहर ${household.maskAvailability} मास्क पहनें (${maskR.central.toFixed(0)} µg/m³ तक कम)`
        : `Use ${household.maskAvailability} mask outdoors (reduces to ${maskR.central.toFixed(0)} µg/m³)`;
  const ventRec =
    ventWindows.length > 0
      ? isHi
        ? `${ventWindows[0]!.startHour}:00-${ventWindows[0]!.endHour}:00 खिड़कियां खोलें`
        : `Open windows ${ventWindows[0]!.startHour}:00-${ventWindows[0]!.endHour}:00`
      : isHi
        ? 'आज खिड़कियां बंद रखें'
        : 'Keep windows closed today';
  return {
    memberName: member.name,
    bestOutdoorWindow: isHi
      ? 'दोपहर 11:00-14:00 (सबसे कम प्रदूषण)'
      : 'Midday 11:00-14:00 (lowest pollution)',
    maskRecommendation: maskRec,
    ventilationWindow: ventRec,
    skip:
      member.sensitivity !== 'none'
        ? isHi
          ? ['बाहरी व्यायाम', 'सुबह की सैर']
          : ['Outdoor exercise', 'Morning walk']
        : [],
  };
}

function buildDemoPlan(
  household: Household,
  forecast: ForecastResponse,
  language: 'en' | 'hi',
): Plan {
  const fs = summarizeForecast(forecast);
  const isHi = language === 'hi';

  const indoorResult = calcIndoorConcentration(
    fs.avgPm25,
    household.windowCondition as WindowCondition,
    household.purifier?.cadrM3PerHour,
    household.purifier?.roomAreaM2,
  );
  const ventWindows = calcVentilationWindows(fs.pm25, indoorResult.central);
  const baseExp = calcExposure(fs.pm25.slice(0, 16));

  const topActions = [
    buildTimingAction(household, fs, baseExp, isHi),
    buildMaskAction(household, fs, isHi),
    buildVentAction(household, indoorResult, ventWindows, isHi),
  ];
  const memberPlans = household.members.map((m) =>
    buildMemberPlan(m, household, fs.avgPm25, ventWindows, isHi),
  );

  const plan: Plan = {
    householdId: household.id ?? 'demo',
    forecastDate: new Date().toISOString().split('T')[0]!,
    language,
    aqiBand: fs.aqiCat.category,
    topActions,
    memberPlans,
    disclaimer: isHi
      ? 'यह चिकित्सा सलाह नहीं है। स्वास्थ्य निर्णयों के लिए चिकित्सक से परामर्श करें। डेटा ±25% अनिश्चितता के साथ सांकेतिक है।'
      : 'This is not medical advice. Consult a physician for health decisions. Data is indicative with ±25% uncertainty.',
    generatedAt: new Date().toISOString(),
  };

  return PlanSchema.parse(plan);
}

export { MAX_TOOL_ITERATIONS, executeTool };
