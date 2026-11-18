/** Tool definitions for the planning agent. */
export const PLAN_TOOLS = [
  {
    name: 'calc_exposure',
    description: 'Calculate total PM2.5 exposure over time periods.',
    input_schema: {
      type: 'object' as const,
      properties: {
        hourlyConcentrations: { type: 'array' as const, items: { type: 'number' as const } },
        hoursPerSlot: { type: 'array' as const, items: { type: 'number' as const } },
      },
      required: ['hourlyConcentrations'] as const,
    },
  },
  {
    name: 'calc_mask_effect',
    description: 'Calculate effective PM2.5 after mask filtration.',
    input_schema: {
      type: 'object' as const,
      properties: {
        ambientPm25: { type: 'number' as const },
        maskType: { type: 'string' as const, enum: ['none', 'surgical', 'n95', 'cloth'] },
        ageGroup: { type: 'string' as const, enum: ['infant', 'child', 'adult', 'elderly'] },
      },
      required: ['ambientPm25', 'maskType', 'ageGroup'] as const,
    },
  },
  {
    name: 'calc_ventilation_windows',
    description: 'Find the best time windows for ventilation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        hourlyOutdoorPm25: { type: 'array' as const, items: { type: 'number' as const } },
        indoorPm25Closed: { type: 'number' as const },
      },
      required: ['hourlyOutdoorPm25', 'indoorPm25Closed'] as const,
    },
  },
  {
    name: 'calc_indoor_concentration',
    description: 'Calculate steady-state indoor PM2.5 concentration.',
    input_schema: {
      type: 'object' as const,
      properties: {
        outdoorPm25: { type: 'number' as const },
        windowCondition: { type: 'string' as const, enum: ['tight', 'average', 'leaky', 'open'] },
        cadrM3PerHour: { type: 'number' as const },
        roomAreaM2: { type: 'number' as const },
        indoorSourceUgPerHour: { type: 'number' as const },
      },
      required: ['outdoorPm25', 'windowCondition'] as const,
    },
  },
  {
    name: 'calc_commute_swap',
    description: 'Compare exposure between two commute modes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        currentMode: { type: 'string' as const, enum: ['car', 'metro', 'bus', 'bicycle', 'walk'] },
        alternativeMode: {
          type: 'string' as const,
          enum: ['car', 'metro', 'bus', 'bicycle', 'walk'],
        },
        commuteHours: { type: 'number' as const },
        ambientPm25: { type: 'number' as const },
      },
      required: ['currentMode', 'alternativeMode', 'commuteHours', 'ambientPm25'] as const,
    },
  },
  {
    name: 'calc_cigarette_equivalent',
    description: 'Convert PM2.5 exposure to cigarette equivalents (rough analogy).',
    input_schema: {
      type: 'object' as const,
      properties: {
        exposureUgM3H: { type: 'number' as const },
      },
      required: ['exposureUgM3H'] as const,
    },
  },
] as const;
