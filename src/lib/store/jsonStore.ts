import { promises as fs } from 'fs';
import path from 'path';
import { HouseholdSchema } from '@/lib/schemas/household';
import type { Household } from '@/lib/schemas/household';
import type { HouseholdRepository } from './repository';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'households.json');

type StoreData = Record<string, Household>;

async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Validate each entry
    const store: StoreData = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const result = HouseholdSchema.safeParse(value);
      if (result.success) {
        store[key] = result.data;
      }
    }
    return store;
  } catch (err: unknown) {
    // File doesn't exist or is corrupt — start fresh
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    console.warn('[jsonStore] readStore error, starting with empty store:', err);
    return {};
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export class JsonHouseholdStore implements HouseholdRepository {
  async get(id: string): Promise<Household | undefined> {
    const store = await readStore();
    return store[id];
  }

  async save(household: Household): Promise<Household> {
    const store = await readStore();
    const id = household.id ?? crypto.randomUUID();
    const saved: Household = { ...household, id };
    store[id] = saved;
    await writeStore(store);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const store = await readStore();
    if (!(id in store)) return false;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete store[id];
    await writeStore(store);
    return true;
  }

  async list(): Promise<Household[]> {
    const store = await readStore();
    return Object.values(store);
  }
}
