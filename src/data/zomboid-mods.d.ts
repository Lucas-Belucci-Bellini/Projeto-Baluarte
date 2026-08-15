export interface ZomboidCollection {
  readonly id: string;
  readonly name: string;
  readonly game: string;
  readonly author: string;
  readonly total: number;
  readonly url: string;
  readonly tagline: string;
  readonly desc: string;
}
export interface ZomboidHighlight { readonly name: string; readonly author: string; }
export interface ZomboidCategory { readonly id: string; readonly label: string; readonly icon: string; readonly desc: string; readonly mods: readonly ZomboidHighlight[]; }
export const ZOMBOID_COLLECTION: ZomboidCollection;
export const ZOMBOID_CATEGORIES: readonly ZomboidCategory[];
