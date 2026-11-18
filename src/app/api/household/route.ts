import { NextRequest } from 'next/server';
import { HouseholdSchema } from '@/lib/schemas/household';
import { JsonHouseholdStore } from '@/lib/store/jsonStore';
import { errorToResponse, ValidationError, NotFoundError } from '@/lib/security/errors';

const store = new JsonHouseholdStore();

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (id) {
      const household = await store.get(id);
      if (!household) throw new NotFoundError(`Household ${id} not found`);
      return Response.json(household);
    }
    const households = await store.list();
    return Response.json({ households });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = HouseholdSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid household data', parsed.error.issues);
    }
    const saved = await store.save(parsed.data);
    return Response.json(saved, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
