export type ModelFileSource = FileList | readonly File[];

export interface UniversalViewerSource {
  readonly url?: string;
  readonly files?: ModelFileSource;
  readonly nome?: string;
}

export interface ViewerStats {
  readonly tris: number;
  readonly verts: number;
  readonly clips: number;
}

export interface LuminanceSample {
  readonly ok: boolean;
  readonly media?: number;
  readonly max?: number;
  readonly largura?: number;
  readonly altura?: number;
  readonly motivo?: string;
}

export interface Viewer3DController {
  readonly rotulo: string;
  readonly temAnimacao: boolean;
  readonly stats: ViewerStats;
  setAnimando(enabled: boolean): void;
  setGiro(enabled: boolean): void;
  amostraLuminancia(): LuminanceSample;
  recentrar(): void;
  dispose(): void;
}

export const FORMATOS: readonly string[];
export function acharEntrada(files: ModelFileSource): File | null;
export function diagnosticoWebGL(): { readonly ok: boolean; readonly webgl2: boolean };
export function montarVisor3D(host: HTMLElement, source: UniversalViewerSource): Promise<Viewer3DController>;
