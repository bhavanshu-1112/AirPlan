import { NextRequest } from 'next/server';
import { z } from 'zod/v4';
import { searchCity } from '@/lib/data/openmeteo';
import { errorToResponse, ValidationError } from '@/lib/security/errors';

const QuerySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') ?? '';
    const parsed = QuerySchema.safeParse({ name });
    if (!parsed.success) {
      throw new ValidationError('Invalid query', parsed.error.issues);
    }
    const results = await searchCity(parsed.data.name);
    return Response.json({ results });
  } catch (error) {
    return errorToResponse(error);
  }
}
