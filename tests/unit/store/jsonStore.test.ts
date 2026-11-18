import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

import { JsonHouseholdStore } from '@/lib/store/jsonStore';

const mockFs = fs as jest.Mocked<typeof fs>;

const validHousehold = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  location: { city: 'Gurugram', latitude: 28.4595, longitude: 77.0266 },
  members: [{ name: 'Test', ageGroup: 'adult' as const, sensitivity: 'none' as const }],
  homeType: 'apartment' as const,
  windowCondition: 'average' as const,
  purifier: null,
  commuteMode: 'car' as const,
  commuteHours: 1,
  cookingHabits: { gasStove: true, timesPerDay: 2 },
  maskAvailability: 'n95' as const,
};

describe('JsonHouseholdStore', () => {
  let store: JsonHouseholdStore;

  beforeEach(() => {
    store = new JsonHouseholdStore();
    jest.clearAllMocks();
  });

  it('returns undefined for missing household', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const result = await store.get('missing-id');
    expect(result).toBeUndefined();
  });

  it('saves a household with existing id', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    const saved = await store.save(validHousehold);
    expect(saved.id).toBe(validHousehold.id);
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('gets a saved household', async () => {
    const storeData = { [validHousehold.id!]: validHousehold };
    mockFs.readFile.mockResolvedValue(JSON.stringify(storeData) as never);
    const result = await store.get(validHousehold.id!);
    expect(result).toBeDefined();
    expect(result?.location.city).toBe('Gurugram');
  });

  it('deletes a household', async () => {
    const storeData = { [validHousehold.id!]: validHousehold };
    mockFs.readFile.mockResolvedValue(JSON.stringify(storeData) as never);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    const result = await store.delete(validHousehold.id!);
    expect(result).toBe(true);
  });

  it('returns false when deleting non-existent household', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const result = await store.delete('non-existent');
    expect(result).toBe(false);
  });

  it('lists all households', async () => {
    const storeData = { [validHousehold.id!]: validHousehold };
    mockFs.readFile.mockResolvedValue(JSON.stringify(storeData) as never);
    const result = await store.list();
    expect(result).toHaveLength(1);
  });

  it('handles corrupt store data', async () => {
    mockFs.readFile.mockResolvedValue('not json' as never);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const result = await store.get('any');
    expect(result).toBeUndefined();
    warnSpy.mockRestore();
  });
});
