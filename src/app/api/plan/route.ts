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

async function resolveHouseholdAndForecast(householdId: string): Promise<{
  household: Household;
  forecast: ForecastResponse;
}> {
  if (process.env['DEMO_MODE'] === 'true') {
    const householdsMap = householdsFixture as Record<string, Household>;
    // eslint-disable-next-line security/detect-object-injection
    const household = householdsMap[householdId];
    if (!household) {
      throw new NotFoundError(`Household ${householdId} not found`);
    }
    const forecast = ForecastResponseSchema.parse(forecastFixture);
    return { household, forecast };
  }

  const store = new JsonHouseholdStore();
  const household = await store.get(householdId);
  if (!household) {
    throw new NotFoundError(`Household ${householdId} not found`);
  }
  const forecast = await fetchForecast(household.location.latitude, household.location.longitude);
  return { household, forecast };
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || 'anonymous';

    const maxReqs = process.env['RATE_LIMIT_MAX'] ? Number(process.env['RATE_LIMIT_MAX']) : 10;
    if (!checkRateLimit(ip, maxReqs, 60000).allowed) {
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
    const { household, forecast } = await resolveHouseholdAndForecast(householdId);
    const plan = await generatePlan(household, forecast, language);
    return Response.json(plan);
  } catch (error) {
    return errorToResponse(error);
  }
}
