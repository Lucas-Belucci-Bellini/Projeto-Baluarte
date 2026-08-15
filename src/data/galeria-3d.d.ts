export interface GalleryModel {
  readonly id: string;
  readonly nome: string;
  readonly arquivo: string;
  readonly tag: string;
  readonly autor: string;
  readonly licenca: string;
  readonly fonte: string;
  readonly desc: string;
}

export const GALERIA_3D: readonly GalleryModel[];
