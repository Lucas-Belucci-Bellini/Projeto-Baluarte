export interface ModelCollection {
  readonly uid: string;
  readonly title: string;
  readonly grupo: 'militar' | 'armas' | 'mechas' | string;
  readonly url: string;
  readonly author: string;
  readonly authorUrl: string;
  readonly count: number;
}

export interface SketchfabModel {
  uid: string;
  name: string;
  url: string;
  author: string;
  authorUrl: string;
  license: string;
  thumb: string | null;
  anim: number;
  cols: string[];
}

export interface ModelSeed {
  readonly gerado: string;
  readonly fonte: string;
  readonly colecoes: readonly ModelCollection[];
  readonly modelos: readonly SketchfabModel[];
}

declare const seed: ModelSeed;
export default seed;
