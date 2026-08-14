/**
 * GeoPulse — motor de rastreio de localização no tempo.
 *
 * Conceito do **geopulse** (tess1o/geopulse): registrar onde você esteve ao
 * longo do tempo e mostrar a trajetória + estatísticas. Usa a Geolocation API
 * do navegador (funciona no celular), acumula os pontos e persiste a trilha no
 * localStorage (assim dá pra fechar e continuar depois).
 *
 * JS puro, sem dependências e sem backend.
 */

import { storage } from '../core/storage.js';

const KEY = 'geo:track';
const MAX_POINTS = 5000;

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

/** Distância em metros entre dois {lat, lon} (Haversine). */
export function haversine(a: GeoCoordinate, b: GeoCoordinate): number {
  const radius = 6371000;
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(b.lat - a.lat);
  const deltaLongitude = toRadians(b.lon - a.lon);
  const latitudeA = toRadians(a.lat);
  const latitudeB = toRadians(b.lat);
  const x = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(x)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isGeoPoint(value: unknown): value is GeoPoint {
  if (!isRecord(value)) return false;
  const optionalNumber = (candidate: unknown): candidate is number | null => (
    candidate === null || isFiniteNumber(candidate)
  );
  return isFiniteNumber(value.lat)
    && isFiniteNumber(value.lon)
    && optionalNumber(value.acc)
    && optionalNumber(value.spd)
    && isFiniteNumber(value.t);
}

export function createGeoTracker(): GeoTracker {
  let points: GeoPoint[] = loadPoints();
  let watchId: number | null = null;

  function loadPoints(): GeoPoint[] {
    const raw: unknown = storage.get<unknown>(KEY, null);
    return Array.isArray(raw) ? raw.filter(isGeoPoint) : [];
  }

  function persist(): void {
    if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS);
    storage.set(KEY, points);
  }

  function start(
    onUpdate?: GeoUpdateHandler,
    onError?: GeoErrorHandler,
  ): boolean {
    if (!('geolocation' in navigator)) {
      onError?.('Geolocalização indisponível neste navegador.');
      return false;
    }
    if (watchId !== null) return true;

    watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const point: GeoPoint = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          acc: position.coords.accuracy ?? null,
          spd: position.coords.speed ?? null,
          t: position.timestamp || Date.now(),
        };
        const last = points[points.length - 1];
        /* só guarda se moveu ≥ 2 m (ou é o 1º) — evita acumular ruído parado */
        if (!last || haversine(last, point) >= 2) {
          points.push(point);
          persist();
        }
        onUpdate?.(stats(), points);
      },
      (error: GeolocationPositionError) => {
        onError?.(error.message || 'Falha ao obter a localização.');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );
    return true;
  }

  function stop(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function isRunning(): boolean {
    return watchId !== null;
  }

  function clear(): void {
    points = [];
    persist();
  }

  function getPoints(): readonly GeoPoint[] {
    return points;
  }

  function stats(): GeoStats {
    let distance = 0;
    let maxSpeed = 0;
    for (let index = 1; index < points.length; index += 1) {
      distance += haversine(points[index - 1], points[index]);
      const speed = points[index].spd;
      if (speed !== null && speed > maxSpeed) maxSpeed = speed;
    }
    const duration = points.length >= 2
      ? points[points.length - 1].t - points[0].t
      : 0;
    const average = duration > 0 ? distance / (duration / 1000) : 0; /* m/s */
    return {
      count: points.length,
      dist: distance,
      dur: duration,
      avg: average,
      maxSpd: maxSpeed,
      cur: points[points.length - 1] ?? null,
    };
  }

  function injectPoint(point: GeoPoint): void {
    points.push(point);
    persist();
  }

  return {
    start,
    stop,
    isRunning,
    clear,
    getPoints,
    stats,
    _injectPoint: injectPoint,
  };
}
