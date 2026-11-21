import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { HouseholdSchema } from '@/lib/schemas/household';
import type { Household } from '@/lib/schemas/household';
import type { HouseholdRepository } from './repository';

type StoreData = Record<string, Household>;

function getDataFilePath(): string {
  if (process.env['VERCEL'] || process.env['AWS_LAMBDA_FUNCTION_NAME']) {
    return path.resolve(os.tmpdir(), 'urban-air-data', 'households.json');
  }
  return path.resolve(process.cwd(), 'data', 'households.json');
}

declare global {
  var __airPlanHouseholdMemory: StoreData | undefined;
}

function getMemoryStore(): StoreData {
  if (!globalThis.__airPlanHouseholdMemory) {
    globalThis.__airPlanHouseholdMemory = {};
  }
  return globalThis.__airPlanHouseholdMemory;
}

export function resetMemoryStore(): void {
  globalThis.__airPlanHouseholdMemory = {};
}

async function readStore(): Promise<StoreData> {
  const memory = getMemoryStore();
  const filePath = getDataFilePath();

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...memory };
    }
    const store: StoreData = { ...memory };
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const result = HouseholdSchema.safeParse(value);
      if (result.success) {
        // eslint-disable-next-line security/detect-object-injection
        store[key] = result.data;
      }
    }
    return store;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn('[jsonStore] readStore error, starting with empty store:', err);
    }
    return { ...memory };
  }
}

async function writeStore(data: StoreData): Promise<void> {
  const memory = getMemoryStore();
  Object.assign(memory, data);

  const filePath = getDataFilePath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[jsonStore] Disk write failed (using memory store):', err);
  }
}

export class JsonHouseholdStore implements HouseholdRepository {
  async get(id: string): Promise<Household | undefined> {
    const store = await readStore();
    // eslint-disable-next-line security/detect-object-injection
    return store[id];
  }

  async save(household: Household): Promise<Household> {
    const store = await readStore();
    const id = household.id ?? crypto.randomUUID();
    const saved: Household = { ...household, id };
    // eslint-disable-next-line security/detect-object-injection
    store[id] = saved;
    await writeStore(store);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const store = await readStore();
    if (!(id in store)) return false;
    // eslint-disable-next-line security/detect-object-injection
    delete store[id];
    const memory = getMemoryStore();
    // eslint-disable-next-line security/detect-object-injection
    delete memory[id];
    await writeStore(store);
    return true;
  }

  async list(): Promise<Household[]> {
    const store = await readStore();
    return Object.values(store);
  }
}
