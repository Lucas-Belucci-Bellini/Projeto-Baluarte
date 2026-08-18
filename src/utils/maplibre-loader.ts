/**
 * Loader único do MapLibre GL (CDN, sob demanda).
 *
 * Morava dentro de src/pages/mapa.js; saiu de lá no dia em que uma SEGUNDA
 * tela (o mapa tático do /vanguard) precisou do mesmo loader — duplicar
 * significaria duas versões pinadas divergindo em silêncio, que é
 * exatamente o defeito que o camadas-mapa.js compartilhado já corrige
 * para as fontes de tile.
 *
 * Resolve com `null` em falha (rede bloqueada, CDN fora) em vez de
 * rejeitar: quem chama mostra o fallback e segue — mapa é acessório,
 * não pré-condição da página.
 */

export interface MapLibreMapOptions {
  readonly container: HTMLElement;
  readonly style: unknown;
  readonly center: readonly [number, number];
  readonly zoom: number;
  readonly pitch?: number;
  readonly maxPitch?: number;
  readonly maxZoom?: number;
  readonly attributionControl?: boolean | Readonly<Record<string, unknown>>;
}

export interface MapLibreLngLat {
  readonly lat: number;
  readonly lng: number;
}

export interface MapLibreEvent {
  readonly lngLat: MapLibreLngLat;
}

export interface MapLibreControl {
  readonly onAdd?: (map: MapLibreMap) => HTMLElement;
  readonly onRemove?: () => void;
}

export interface MapLibreMap {
  addControl(control: MapLibreControl, position?: string): this;
  on(type: string, listener: (event: MapLibreEvent) => void): this;
}

/** O que `setLngLat` aceita: o `lngLat` do evento de clique, ou o par [lon, lat]. */
export type MapLibreLngLatLike = MapLibreLngLat | readonly [number, number];

/**
 * Um marcador no mapa. Encadeável, como a API do MapLibre: o `/vanguard` faz
 * `new ml.Marker({…}).setLngLat(p).addTo(mapa)` para pôr a peça e o alvo.
 */
export interface MapLibreMarker {
  setLngLat(lngLat: MapLibreLngLatLike): this;
  addTo(map: MapLibreMap): this;
  remove(): this;
}

export interface MapLibreNamespace {
  readonly Map: new (options: MapLibreMapOptions) => MapLibreMap;
  readonly Marker: new (
    options?: Readonly<Record<string, unknown>>,
  ) => MapLibreMarker;
  readonly NavigationControl: new (
    options?: Readonly<Record<string, unknown>>,
  ) => MapLibreControl;
  readonly ScaleControl: new (
    options?: Readonly<Record<string, unknown>>,
  ) => MapLibreControl;
}

declare global {
  interface Window {
    maplibregl?: MapLibreNamespace;
  }
}

let loadPromise: Promise<MapLibreNamespace | null> | null = null;

export function loadMapLibre(): Promise<MapLibreNamespace | null> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<MapLibreNamespace | null>((resolve) => {
    if (window.maplibregl) {
      resolve(window.maplibregl);
      return;
    }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    script.onload = () => resolve(window.maplibregl ?? null);
    script.onerror = () => {
      loadPromise = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
