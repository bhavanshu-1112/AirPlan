import { NextRequest } from 'next/server';
import { z } from 'zod/v4';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  errorToResponse,
  RateLimitError,
  ValidationError,
  NotFoundError,
} from '@/lib/security/errors';
import householdsFixture from '@/fixtures/households.json';
import forecastFixture from '@/fixtures/forecast.json';
import { ForecastResponseSchema } from '@/lib/schemas/forecast';
import type { ForecastResponse } from '@/lib/schemas/forecast';
import type { Household } from '@/lib/schemas/household';
import { JsonHouseholdStore } from '@/lib/store/jsonStore';
import { fetchForecast } from '@/lib/data/openmeteo';
import { generatePlan } from '@/lib/llm/planAgent';

const PlanRequestSchema = z
  .object({
    householdId: z.string(),
    language: z.enum(['en', 'hi']).optional(),
  })
  .strict();

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || 'anonymous';

    const rateResult = checkRateLimit(ip, 10, 60000);
    if (!rateResult.allowed) {
      throw new RateLimitError();
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parsed = PlanRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ValidationError('Invalid plan request', parsed.error.issues);
    }

    const { householdId, language } = parsed.data;

    let household: Household | undefined;
    let forecast: ForecastResponse;

    if (process.env['DEMO_MODE'] === 'true') {
      const householdsMap = householdsFixture as Record<string, Household>;
      household = householdsMap[householdId];
      if (!household) {
        throw new NotFoundError(`Household ${householdId} not found`);
      }
      forecast = ForecastResponseSchema.parse(forecastFixture);
    } else {
      const store = new JsonHouseholdStore();
      household = await store.get(householdId);
      if (!household) {
        throw new NotFoundError(`Household ${householdId} not found`);
      }
      forecast = await fetchForecast(
        household.location.latitude,
        household.location.longitude,
      );
    }

    const plan = await generatePlan(household, forecast, language);
    return Response.json(plan);
  } catch (error) {
    return errorToResponse(error);
  }
}
