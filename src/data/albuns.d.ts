export interface AlbumTrack {
  titulo: string;
  url?: string;
}

export interface Album {
  titulo: string;
  artista: string;
  ano: number;
  capa?: string;
  faixas?: readonly AlbumTrack[];
}

export declare const ALBUNS: readonly Album[];
