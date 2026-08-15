export interface MapBaseLayer {
  readonly id: string;
  readonly nome: string;
  readonly desc: string;
  readonly padrao?: boolean;
  readonly tileSize: number;
  readonly maxzoom: number;
  readonly tiles: readonly string[];
  readonly creditos: string;
}

export interface MapOverlayLayer {
  readonly id: string;
  readonly nome: string;
  readonly desc: string;
  readonly tipo: 'raster' | 'hillshade';
  readonly padrao?: boolean;
  readonly tileSize?: number;
  readonly maxzoom?: number;
  readonly opacidade?: number;
  readonly tiles?: readonly string[];
  readonly fonteDem?: string;
  readonly exageroPadrao?: number;
  readonly creditos: string;
}

export interface MapDemLayer {
  readonly id: string;
  readonly nome: string;
  readonly tipo: 'raster-dem';
  readonly tileSize: number;
  readonly maxzoom: number;
  readonly encoding: 'terrarium';
  readonly tiles: readonly string[];
  readonly creditos: string;
}

export interface MapStyle {
  readonly version: 8;
  readonly sources: Readonly<Record<string, unknown>>;
  readonly layers: readonly Readonly<Record<string, unknown>>[];
  readonly glyphs?: string;
}

export const CAMADAS_BASE: readonly MapBaseLayer[];
export const CAMADAS_OVERLAY: readonly MapOverlayLayer[];
export const CAMADA_DEM: MapDemLayer;
export function dataGibs(agora?: number): string;
export function creditosDe(ids?: readonly string[] | null): string[];
export function camadaPorId(id: string): MapBaseLayer | MapOverlayLayer | MapDemLayer | null;
export function estiloMapLibre(options?: { readonly base?: string; readonly overlays?: readonly string[]; readonly glyphs?: string | null; readonly incluirDem?: boolean }): MapStyle;
