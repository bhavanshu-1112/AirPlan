import { z } from 'zod/v4';

export const ImpactCardSchema = z
  .object({
    title: z.string(),
    beforeExposure: z.number(),
    afterExposure: z.number(),
    exposureSaved: z.number(),
    cigaretteEquivalentSaved: z.number(),
    formula: z.string(),
    inputs: z.record(z.string(), z.number()),
    range: z.object({ low: z.number(), central: z.number(), high: z.number() }).strict(),
    dataSourceLabel: z.string(),
    toolCallId: z.string().optional(),
  })
  .strict();

export const RecommendationSchema = z
  .object({
    action: z.string(),
    reason: z.string(),
    impactCard: ImpactCardSchema,
    memberNames: z.array(z.string()),
  })
  .strict();

export const MemberPlanSchema = z
  .object({
    memberName: z.string(),
    bestOutdoorWindow: z.string(),
    maskRecommendation: z.string(),
    ventilationWindow: z.string(),
    skip: z.array(z.string()),
  })
  .strict();

export const PlanSchema = z
  .object({
    householdId: z.string(),
    forecastDate: z.string(),
    language: z.enum(['en', 'hi']),
    aqiBand: z.string(),
    topActions: z.array(RecommendationSchema).min(1).max(5),
    memberPlans: z.array(MemberPlanSchema).min(1),
    disclaimer: z.string(),
    generatedAt: z.string(),
  })
  .strict();

export type ImpactCard = z.infer<typeof ImpactCardSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type MemberPlan = z.infer<typeof MemberPlanSchema>;
export type Plan = z.infer<typeof PlanSchema>;
