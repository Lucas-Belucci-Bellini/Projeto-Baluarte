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

export interface MapLibreNamespace {
  readonly Map: new (options: MapLibreMapOptions) => MapLibreMap;
  readonly NavigationControl: new (
    options?: Readonly<Record<string, unknown>>,
  ) => MapLibreControl;
  readonly ScaleControl: new (
    options?: Readonly<Record<string, unknown>>,
  ) => MapLibreControl;
}

export function loadMapLibre(): Promise<MapLibreNamespace | null>;
