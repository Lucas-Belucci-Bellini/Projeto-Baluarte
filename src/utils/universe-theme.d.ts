export interface UniverseSkin {
  readonly id: string;
  readonly label: string;
  readonly primary: string;
  readonly secondary: string;
}

export const UNIVERSE_SKINS: readonly UniverseSkin[];
export function getUniverseId(): string;
export function setUniverse(id: string): string;
