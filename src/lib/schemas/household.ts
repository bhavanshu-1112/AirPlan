import { z } from 'zod/v4';

export const AgeGroupSchema = z.enum(['infant', 'child', 'adult', 'elderly']);
export const SensitivitySchema = z.enum(['none', 'asthma', 'heart-condition']);
export const WindowConditionSchema = z.enum(['tight', 'average', 'leaky']);
export const MaskTypeSchema = z.enum(['none', 'surgical', 'n95']);
export const CommuteModeSchema = z.enum(['car', 'metro', 'bus', 'bicycle', 'walk', 'none']);

export const LocationSchema = z
  .object({
    city: z.string().min(1).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

export const MemberSchema = z
  .object({
    name: z.string().min(1).max(50),
    ageGroup: AgeGroupSchema,
    sensitivity: SensitivitySchema,
  })
  .strict();

export const PurifierSchema = z
  .object({
    cadrM3PerHour: z.number().min(0).max(1000),
    roomAreaM2: z.number().min(1).max(200),
  })
  .strict();

export const CookingHabitsSchema = z
  .object({
    gasStove: z.boolean(),
    timesPerDay: z.number().int().min(0).max(10),
  })
  .strict();

export const HouseholdSchema = z
  .object({
    id: z.string().uuid().optional(),
    location: LocationSchema,
    members: z.array(MemberSchema).min(1).max(10),
    homeType: z.enum(['apartment', 'independent-house']),
    windowCondition: WindowConditionSchema,
    purifier: PurifierSchema.nullable(),
    commuteMode: CommuteModeSchema,
    commuteHours: z.number().min(0).max(12),
    cookingHabits: CookingHabitsSchema,
    maskAvailability: MaskTypeSchema,
  })
  .strict();

export type AgeGroup = z.infer<typeof AgeGroupSchema>;
export type Sensitivity = z.infer<typeof SensitivitySchema>;
export type WindowCondition = z.infer<typeof WindowConditionSchema>;
export type MaskType = z.infer<typeof MaskTypeSchema>;
export type CommuteMode = z.infer<typeof CommuteModeSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Purifier = z.infer<typeof PurifierSchema>;
export type CookingHabits = z.infer<typeof CookingHabitsSchema>;
export type Household = z.infer<typeof HouseholdSchema>;
