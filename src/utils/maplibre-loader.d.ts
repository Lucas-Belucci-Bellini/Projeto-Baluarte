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

export function loadMapLibre(): Promise<MapLibreNamespace | null>;
