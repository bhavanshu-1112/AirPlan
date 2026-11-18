import {
  HouseholdSchema,
  MemberSchema,
  LocationSchema,
  PurifierSchema,
} from '../../../src/lib/schemas/household';

const validHousehold = {
  location: { city: 'Delhi', latitude: 28.6, longitude: 77.2 },
  members: [{ name: 'Alice', ageGroup: 'adult', sensitivity: 'none' }],
  homeType: 'apartment',
  windowCondition: 'average',
  purifier: { cadrM3PerHour: 200, roomAreaM2: 20 },
  commuteMode: 'metro',
  commuteHours: 1,
  cookingHabits: { gasStove: true, timesPerDay: 3 },
  maskAvailability: 'n95',
};

describe('HouseholdSchema', () => {
  it('accepts a valid household without id', () => {
    const result = HouseholdSchema.safeParse(validHousehold);
    expect(result.success).toBe(true);
  });

  it('accepts a valid household with optional id', () => {
    const result = HouseholdSchema.safeParse({
      ...validHousehold,
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects household with no members', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, members: [] });
    expect(result.success).toBe(false);
  });

  it('rejects household with more than 10 members', () => {
    const member = { name: 'X', ageGroup: 'adult', sensitivity: 'none' };
    const result = HouseholdSchema.safeParse({
      ...validHousehold,
      members: Array(11).fill(member),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid homeType', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, homeType: 'villa' });
    expect(result.success).toBe(false);
  });

  it('rejects extra unknown fields (strict mode)', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, extraField: 'oops' });
    expect(result.success).toBe(false);
  });

  it('allows purifier to be null', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, purifier: null });
    expect(result.success).toBe(true);
  });

  it('rejects commuteHours out of range', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, commuteHours: 13 });
    expect(result.success).toBe(false);
  });

  it('rejects negative commuteHours', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, commuteHours: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid uuid for id', () => {
    const result = HouseholdSchema.safeParse({ ...validHousehold, id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { location: _loc, ...rest } = validHousehold;
    void _loc;
    const result = HouseholdSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('LocationSchema', () => {
  it('accepts valid coordinates', () => {
    const result = LocationSchema.safeParse({ city: 'Mumbai', latitude: 19.07, longitude: 72.87 });
    expect(result.success).toBe(true);
  });

  it('rejects latitude out of range', () => {
    const result = LocationSchema.safeParse({ city: 'X', latitude: 95, longitude: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude out of range', () => {
    const result = LocationSchema.safeParse({ city: 'X', latitude: 0, longitude: 200 });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = LocationSchema.safeParse({ city: '', latitude: 0, longitude: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const result = LocationSchema.safeParse({
      city: 'Delhi',
      latitude: 28,
      longitude: 77,
      country: 'IN',
    });
    expect(result.success).toBe(false);
  });
});

describe('MemberSchema', () => {
  it('accepts valid member', () => {
    const result = MemberSchema.safeParse({
      name: 'Bob',
      ageGroup: 'child',
      sensitivity: 'asthma',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid ageGroup', () => {
    const result = MemberSchema.safeParse({
      name: 'Bob',
      ageGroup: 'teenager',
      sensitivity: 'none',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sensitivity', () => {
    const result = MemberSchema.safeParse({
      name: 'Bob',
      ageGroup: 'adult',
      sensitivity: 'allergy',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = MemberSchema.safeParse({ name: '', ageGroup: 'adult', sensitivity: 'none' });
    expect(result.success).toBe(false);
  });
});

describe('PurifierSchema', () => {
  it('accepts valid purifier', () => {
    const result = PurifierSchema.safeParse({ cadrM3PerHour: 300, roomAreaM2: 25 });
    expect(result.success).toBe(true);
  });

  it('rejects negative cadr', () => {
    const result = PurifierSchema.safeParse({ cadrM3PerHour: -1, roomAreaM2: 25 });
    expect(result.success).toBe(false);
  });

  it('rejects cadr over 1000', () => {
    const result = PurifierSchema.safeParse({ cadrM3PerHour: 1001, roomAreaM2: 25 });
    expect(result.success).toBe(false);
  });

  it('rejects room area below 1', () => {
    const result = PurifierSchema.safeParse({ cadrM3PerHour: 100, roomAreaM2: 0 });
    expect(result.success).toBe(false);
  });
});
