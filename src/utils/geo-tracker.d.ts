export interface GeoCoordinate {
  readonly lat: number;
  readonly lon: number;
}

export interface GeoPoint extends GeoCoordinate {
  readonly acc: number | null;
  readonly spd: number | null;
  readonly t: number;
}

export interface GeoStats {
  readonly count: number;
  readonly dist: number;
  readonly dur: number;
  readonly avg: number;
  readonly maxSpd: number;
  readonly cur: GeoPoint | null;
}

export type GeoUpdateHandler = (
  stats: GeoStats,
  points: readonly GeoPoint[],
) => void;

export type GeoErrorHandler = (message: string) => void;

export interface GeoTracker {
  start(onUpdate?: GeoUpdateHandler, onError?: GeoErrorHandler): boolean;
  stop(): void;
  isRunning(): boolean;
  clear(): void;
  getPoints(): readonly GeoPoint[];
  stats(): GeoStats;
  _injectPoint(point: GeoPoint): void;
}

export function haversine(a: GeoCoordinate, b: GeoCoordinate): number;
export function createGeoTracker(): GeoTracker;
