import type { RadarDetection } from './radar-dsp.js';

export interface TrackerOptions {
  readonly gate?: number;
  readonly alpha?: number;
  readonly beta?: number;
  readonly confirmHits?: number;
  readonly maxCoast?: number;
  readonly maxTentativeMiss?: number;
  readonly trailMax?: number;
  readonly maxTracks?: number;
}

export interface RadarTrack {
  id: number;
  r: number;
  c: number;
  vr: number;
  vc: number;
  snr: number;
  hits: number;
  misses: number;
  age: number;
  confirmed: boolean;
  updated: boolean;
  trail: Array<[number, number]>;
}

export interface RadarTracker {
  readonly tracks: RadarTrack[];
  update(detections: readonly RadarDetection[]): RadarTrack[];
  reset(): void;
  confirmed(): RadarTrack[];
}

export function createTracker(options?: TrackerOptions): RadarTracker;
