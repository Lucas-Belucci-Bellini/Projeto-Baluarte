export interface ArsenalCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ArsenalWeapon {
  id: string;
  name: string;
  category: string;
  origin: string;
  caliber?: string;
  notes?: string;
  equipe?: string;
  tier: string;
  year?: number | string;
  rangeM?: number;
  weightKg?: number;
  subcat?: string;
  wiki?: string;
  specs?: readonly (readonly [string, string | number | null])[];
}

export interface ArsenalDoctrine {
  title: string;
  summary: string;
  items: readonly string[];
}

export const ARSENAL: readonly ArsenalWeapon[];
export const CATEGORIES: readonly ArsenalCategory[];
export const EQUIPES: readonly string[];
export const DOUTRINAS: readonly ArsenalDoctrine[];
export const TOTAL: number;
export function byCategory(categoryId: string): ArsenalWeapon[];
export function search(term: string): ArsenalWeapon[];
