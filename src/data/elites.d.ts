export interface Equipe {
  code: string;
  name: string;
  specialty: string;
  leader: string;
  members: number;
  motto: string;
  status: string;
  cover: string;
  color: string;
  base: string;
  formed: number;
  description: string;
  equipment: readonly string[];
  notableOps: readonly string[];
  arc: string;
}

export const EQUIPES: readonly Equipe[];
export const TOTAL_EQUIPES: number;
export const ACTIVE_COUNT: number;
export const STATUS_OPTIONS: readonly string[];
export const SPECIALTIES: readonly string[];
export function findEquipe(code: string): Equipe | undefined;
export function statusInfo(id: string): { label: string; color: string } | undefined;
