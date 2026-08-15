export interface MusicaPropria {
  uid: string;
  capa?: string;
  n: number;
  titulo: string;
  url: string;
  embed: string;
}

export interface MusicaLocal {
  id: string;
  titulo: string;
  arquivo: string;
}

export declare const SUNO_PERFIL: string;
export declare const MUSICAS_PROPRIAS: readonly MusicaPropria[];
export declare const MUSICAS_LOCAIS: readonly MusicaLocal[];
