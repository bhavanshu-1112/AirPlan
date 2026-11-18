import { NextRequest } from 'next/server';
import { z } from 'zod/v4';
import { fetchForecast } from '@/lib/data/openmeteo';
import { errorToResponse, ValidationError } from '@/lib/security/errors';

const QuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const url = new URL(request.url);
    const latitude = url.searchParams.get('latitude') ?? '';
    const longitude = url.searchParams.get('longitude') ?? '';
    const parsed = QuerySchema.safeParse({ latitude, longitude });
    if (!parsed.success) {
      throw new ValidationError('Invalid coordinates', parsed.error.issues);
    }
    const forecast = await fetchForecast(parsed.data.latitude, parsed.data.longitude);
    return Response.json(forecast);
  } catch (error) {
    return errorToResponse(error);
  }
}
