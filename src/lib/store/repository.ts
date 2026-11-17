import type { Household } from '@/lib/schemas/household';

export interface HouseholdRepository {
  get(id: string): Promise<Household | undefined>;
  save(household: Household): Promise<Household>;
  delete(id: string): Promise<boolean>;
  list(): Promise<Household[]>;
}
