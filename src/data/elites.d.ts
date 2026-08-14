export interface EliteStatusInfo {
  id: string;
  label: string;
  color: string;
}

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
  arc: string | null;
}

export const EQUIPES: readonly Equipe[];
export const TOTAL_EQUIPES: number;
export const ACTIVE_COUNT: number;
export const STATUS_OPTIONS: readonly EliteStatusInfo[];
export const SPECIALTIES: readonly string[];
export function findEquipe(code: string): Equipe | null;
export function statusInfo(id: string): EliteStatusInfo;
