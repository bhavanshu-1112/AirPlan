import {
  HouseholdSchema,
  MemberSchema,
  LocationSchema,
  PurifierSchema,
  CookingHabitsSchema,
  AgeGroupSchema,
  SensitivitySchema,
  WindowConditionSchema,
  MaskTypeSchema,
  CommuteModeSchema,
} from '@/lib/schemas/household';
import { PlanSchema, ImpactCardSchema, RecommendationSchema, MemberPlanSchema } from '@/lib/schemas/plan';
import { AuditFindingSchema, AuditResultSchema } from '@/lib/schemas/audit';
import {
  ForecastResponseSchema,
  GeocodingResultSchema,
  HourlyForecastSchema,
} from '@/lib/schemas/forecast';

describe('household schemas', () => {
  it('validates a complete valid household', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      location: { city: 'Delhi', latitude: 28.6139, longitude: 77.209 },
      members: [{ name: 'Amit', ageGroup: 'adult', sensitivity: 'none' }],
      homeType: 'apartment',
      windowCondition: 'average',
      purifier: null,
      commuteMode: 'car',
      commuteHours: 1,
      cookingHabits: { gasStove: true, timesPerDay: 2 },
      maskAvailability: 'n95',
    };
    const result = HouseholdSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects extra fields in strict mode', () => {
    const invalid = {
      location: { city: 'Delhi', latitude: 28.6, longitude: 77.2, extra: true },
      members: [{ name: 'A', ageGroup: 'adult', sensitivity: 'none' }],
      homeType: 'apartment',
      windowCondition: 'average',
      purifier: null,
      commuteMode: 'car',
      commuteHours: 1,
      cookingHabits: { gasStove: true, timesPerDay: 2 },
      maskAvailability: 'n95',
    };
    const result = HouseholdSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates all enum values', () => {
    expect(AgeGroupSchema.safeParse('infant').success).toBe(true);
    expect(AgeGroupSchema.safeParse('child').success).toBe(true);
    expect(AgeGroupSchema.safeParse('adult').success).toBe(true);
    expect(AgeGroupSchema.safeParse('elderly').success).toBe(true);
    expect(AgeGroupSchema.safeParse('teen').success).toBe(false);

    expect(SensitivitySchema.safeParse('none').success).toBe(true);
    expect(SensitivitySchema.safeParse('asthma').success).toBe(true);
    expect(SensitivitySchema.safeParse('heart-condition').success).toBe(true);

    expect(WindowConditionSchema.safeParse('tight').success).toBe(true);
    expect(WindowConditionSchema.safeParse('average').success).toBe(true);
    expect(WindowConditionSchema.safeParse('leaky').success).toBe(true);

    expect(MaskTypeSchema.safeParse('none').success).toBe(true);
    expect(MaskTypeSchema.safeParse('surgical').success).toBe(true);
    expect(MaskTypeSchema.safeParse('n95').success).toBe(true);

    expect(CommuteModeSchema.safeParse('car').success).toBe(true);
    expect(CommuteModeSchema.safeParse('metro').success).toBe(true);
    expect(CommuteModeSchema.safeParse('walk').success).toBe(true);
  });

  it('enforces member array bounds', () => {
    const base = {
      location: { city: 'Delhi', latitude: 28.6, longitude: 77.2 },
      homeType: 'apartment' as const,
      windowCondition: 'average' as const,
      purifier: null,
      commuteMode: 'car' as const,
      commuteHours: 1,
      cookingHabits: { gasStove: true, timesPerDay: 2 },
      maskAvailability: 'n95' as const,
    };

    // Empty members should fail
    expect(HouseholdSchema.safeParse({ ...base, members: [] }).success).toBe(false);

    // 1 member should pass
    expect(
      HouseholdSchema.safeParse({
        ...base,
        members: [{ name: 'A', ageGroup: 'adult', sensitivity: 'none' }],
      }).success,
    ).toBe(true);
  });
});

describe('plan schemas', () => {
  it('validates a valid impact card', () => {
    const card = {
      title: 'Test',
      beforeExposure: 100,
      afterExposure: 50,
      exposureSaved: 50,
      cigaretteEquivalentSaved: 0.1,
      formula: 'E = C × t',
      inputs: { C: 100, t: 1 },
      range: { low: 40, central: 50, high: 60 },
      dataSourceLabel: 'Test source',
    };
    expect(ImpactCardSchema.safeParse(card).success).toBe(true);
  });

  it('validates a valid recommendation', () => {
    const rec = {
      action: 'Wear mask',
      reason: 'Reduces exposure',
      impactCard: {
        title: 'Mask',
        beforeExposure: 100,
        afterExposure: 24,
        exposureSaved: 76,
        cigaretteEquivalentSaved: 0.14,
        formula: 'C × (1 - eff × fit)',
        inputs: { C: 100, eff: 0.95, fit: 0.8 },
        range: { low: 18, central: 24, high: 30 },
        dataSourceLabel: 'NIOSH',
      },
      memberNames: ['Amit'],
    };
    expect(RecommendationSchema.safeParse(rec).success).toBe(true);
  });

  it('validates a member plan', () => {
    const mp = {
      memberName: 'Amit',
      bestOutdoorWindow: '11:00-14:00',
      maskRecommendation: 'Use N95',
      ventilationWindow: 'Open windows 11:00-14:00',
      skip: ['Morning walk'],
    };
    expect(MemberPlanSchema.safeParse(mp).success).toBe(true);
  });
});

describe('audit schemas', () => {
  it('validates a finding', () => {
    const finding = {
      category: 'ventilation',
      observation: 'Windows appear sealed',
      confidence: 0.8,
      suggestedFix: 'Open windows during low-pollution hours',
    };
    expect(AuditFindingSchema.safeParse(finding).success).toBe(true);
  });

  it('validates an audit result', () => {
    const result = {
      findings: [],
      noFindings: true,
      message: 'No issues detected',
    };
    expect(AuditResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects invalid confidence range', () => {
    const invalid = {
      category: 'ventilation',
      observation: 'Test',
      confidence: 1.5,
      suggestedFix: 'Fix',
    };
    expect(AuditFindingSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('forecast schemas', () => {
  it('validates a geocoding result', () => {
    const result = {
      name: 'Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      country: 'India',
    };
    expect(GeocodingResultSchema.safeParse(result).success).toBe(true);
  });

  it('validates hourly forecast', () => {
    const hourly = {
      time: ['2024-01-01T00:00'],
      pm2_5: [45.2],
      pm10: [80.1],
      us_aqi: [120],
    };
    expect(HourlyForecastSchema.safeParse(hourly).success).toBe(true);
  });

  it('validates full forecast response', () => {
    const response = {
      hourly: {
        time: ['2024-01-01T00:00'],
        pm2_5: [45.2],
        pm10: [80.1],
        us_aqi: [120],
      },
      hourly_units: { pm2_5: 'µg/m³', pm10: 'µg/m³', us_aqi: '' },
    };
    expect(ForecastResponseSchema.safeParse(response).success).toBe(true);
  });
});
