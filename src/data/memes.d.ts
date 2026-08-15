export type MemeTier = 'lendario' | 'classico' | 'viral';

export interface MemeCategory {
  readonly id: string;
  readonly label: string;
}

export interface Meme2016 {
  readonly id: string;
  readonly nome: string;
  readonly quando: string;
  readonly categoria: string;
  readonly glyph: string;
  readonly frase: string;
  readonly tier: MemeTier;
  readonly origem: string;
  readonly descricao: string;
}

export const MEME_CATEGORIES: readonly MemeCategory[];
export const MEMES_2016: readonly Meme2016[];
