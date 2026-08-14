export interface Universo {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  color?: string;
  cover?: string;
  [key: string]: unknown;
}

export const UNIVERSOS: readonly Universo[];
export const TOTAL_UNIVERSOS: number;
export function findUniverso(id: string): Universo | undefined;
