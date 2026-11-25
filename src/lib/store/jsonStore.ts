import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { HouseholdSchema } from '@/lib/schemas/household';
import type { Household } from '@/lib/schemas/household';
import type { HouseholdRepository } from './repository';
import { logger } from '@/lib/security/logger';

type StoreData = Record<string, Household>;

/** Type guard for Node.js filesystem errors. */
function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

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
    const storeMap = new Map<string, Household>(Object.entries(memory));
    const record = parsed as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      const result = HouseholdSchema.safeParse(value);
      if (result.success) {
        storeMap.set(key, result.data);
      }
    }
    return Object.fromEntries(storeMap);
  } catch (err: unknown) {
    const code = isNodeError(err) ? err.code : undefined;
    if (code !== 'ENOENT') {
      logger.warn('[jsonStore] readStore error, starting with empty store', {
        error: err instanceof Error ? err.message : String(err),
      });
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
    logger.warn('[jsonStore] Disk write failed (using memory store)', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export class JsonHouseholdStore implements HouseholdRepository {
  async get(id: string): Promise<Household | undefined> {
    const store = await readStore();
    return new Map<string, Household>(Object.entries(store)).get(id);
  }

  async save(household: Household): Promise<Household> {
    const store = await readStore();
    const id = household.id ?? crypto.randomUUID();
    const saved: Household = { ...household, id };
    const map = new Map<string, Household>(Object.entries(store));
    map.set(id, saved);
    await writeStore(Object.fromEntries(map));
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const store = await readStore();
    const map = new Map<string, Household>(Object.entries(store));
    if (!map.has(id)) return false;
    map.delete(id);
    const memory = getMemoryStore();
    const memoryMap = new Map<string, Household>(Object.entries(memory));
    memoryMap.delete(id);
    globalThis.__airPlanHouseholdMemory = Object.fromEntries(memoryMap);
    await writeStore(Object.fromEntries(map));
    return true;
  }

  async list(): Promise<Household[]> {
    const store = await readStore();
    return Object.values(store);
  }
}
