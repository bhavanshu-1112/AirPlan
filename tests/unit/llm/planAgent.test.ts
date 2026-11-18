import { generatePlan } from '@/lib/llm/planAgent';
import { PlanSchema } from '@/lib/schemas/plan';
import { ForecastResponseSchema } from '@/lib/schemas/forecast';
import type { Household } from '@/lib/schemas/household';
import householdsFixture from '@/fixtures/households.json';
import forecastFixture from '@/fixtures/forecast.json';

describe('planAgent - generatePlan', () => {
  const householdsMap = householdsFixture as Record<string, Household>;
  const householdA = householdsMap['demo-a']!;
  const householdB = householdsMap['demo-b']!;
  const forecast = ForecastResponseSchema.parse(forecastFixture);

  it('returns a valid Plan conforming to PlanSchema for both demo households', async () => {
    const planA = await generatePlan(householdA, forecast, 'en');
    const planB = await generatePlan(householdB, forecast, 'en');

    expect(() => PlanSchema.parse(planA)).not.toThrow();
    expect(() => PlanSchema.parse(planB)).not.toThrow();
  });

  it('produces different plans for different households (member counts and mask recommendations)', async () => {
    const planA = await generatePlan(householdA, forecast, 'en');
    const planB = await generatePlan(householdB, forecast, 'en');

    // Compare member counts
    expect(planA.memberPlans).toHaveLength(4);
    expect(planB.memberPlans).toHaveLength(2);
    expect(planA.memberPlans.length).not.toBe(planB.memberPlans.length);

    // Compare mask recommendations (demo-a has n95, demo-b has surgical)
    const adultPlanA = planA.memberPlans.find((m) => m.memberName === 'Amit');
    const elderlyPlanB = planB.memberPlans.find((m) => m.memberName === 'Mr. Gupta');

    expect(adultPlanA?.maskRecommendation).toContain('n95');
    expect(elderlyPlanB?.maskRecommendation).toContain('surgical');
  });

  it('recommends no mask for infant members', async () => {
    const planA = await generatePlan(householdA, forecast, 'en');
    const infantPlan = planA.memberPlans.find((m) => m.memberName === 'Baby Sharma');

    expect(infantPlan).toBeDefined();
    expect(infantPlan?.maskRecommendation).toContain('No mask recommended');
  });

  it('has between 1 and 5 topActions', async () => {
    const planA = await generatePlan(householdA, forecast, 'en');
    const planB = await generatePlan(householdB, forecast, 'en');

    expect(planA.topActions.length).toBeGreaterThanOrEqual(1);
    expect(planA.topActions.length).toBeLessThanOrEqual(5);

    expect(planB.topActions.length).toBeGreaterThanOrEqual(1);
    expect(planB.topActions.length).toBeLessThanOrEqual(5);
  });

  it('ensures each impact card has beforeExposure, afterExposure, formula, and range', async () => {
    const planA = await generatePlan(householdA, forecast, 'en');

    for (const item of planA.topActions) {
      const card = item.impactCard;
      expect(typeof card.beforeExposure).toBe('number');
      expect(typeof card.afterExposure).toBe('number');
      expect(typeof card.exposureSaved).toBe('number');
      expect(typeof card.cigaretteEquivalentSaved).toBe('number');
      expect(typeof card.formula).toBe('string');
      expect(card.formula.length).toBeGreaterThan(0);
      expect(card.range).toBeDefined();
      expect(typeof card.range.low).toBe('number');
      expect(typeof card.range.central).toBe('number');
      expect(typeof card.range.high).toBe('number');
    }
  });

  it("produces Hindi text with Devanagari characters when language is 'hi'", async () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const planHi = await generatePlan(householdA, forecast, 'hi');

    expect(PlanSchema.parse(planHi)).toBeDefined();
    expect(planHi.language).toBe('hi');
    expect(devanagariRegex.test(planHi.disclaimer)).toBe(true);

    const firstAction = planHi.topActions[0];
    expect(firstAction).toBeDefined();
    expect(devanagariRegex.test(firstAction!.action)).toBe(true);
    expect(devanagariRegex.test(firstAction!.reason)).toBe(true);

    const firstMember = planHi.memberPlans[0];
    expect(firstMember).toBeDefined();
    expect(devanagariRegex.test(firstMember!.maskRecommendation)).toBe(true);
    expect(devanagariRegex.test(firstMember!.bestOutdoorWindow)).toBe(true);
  });

  it("produces English text with no Devanagari characters when language is 'en'", async () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const planEn = await generatePlan(householdA, forecast, 'en');

    expect(planEn.language).toBe('en');
    expect(devanagariRegex.test(JSON.stringify(planEn))).toBe(false);
  });
});
