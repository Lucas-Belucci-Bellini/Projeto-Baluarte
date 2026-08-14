export type UniversoType = 'core' | 'crossover';

export interface Universo {
  id: string;
  name: string;
  tagline: string;
  color: string;
  icon: string;
  type: UniversoType;
  summary: string;
  keyFacts: readonly string[];
  factions: readonly string[];
  threats: readonly string[];
  media: readonly string[];
  arcs: readonly string[];
}

export const UNIVERSOS: readonly Universo[];
export const TOTAL_UNIVERSOS: number;
export function findUniverso(id: string): Universo | null;
