export type RadarMode = 'mock' | 'replay' | 'bridge' | 'acoustic' | 'passive';

export interface RadarFrame {
  readonly index: number;
  readonly timestamp: number;
  readonly rows: number;
  readonly cols: number;
  readonly mag: Float32Array;
}

export interface RadarSourceOptions {
  readonly fps?: number;
  readonly url?: string;
  readonly freq?: number;
  readonly volume?: number;
  readonly N?: number;
  readonly onError?: (message: string) => void;
}

export interface RadarSource {
  readonly kind: RadarMode;
  readonly fps: number;
  readonly rangeBins: number;
  readonly dopplerBins: number;
  readonly frameSize: number;
  readonly connected?: boolean;
  start(onFrame: (frame: RadarFrame) => void): void | Promise<void>;
  stop(): void;
}

export class MockSource implements RadarSource {
  readonly kind: 'mock'; readonly fps: number; readonly rangeBins: number; readonly dopplerBins: number; readonly frameSize: number;
  constructor(options?: RadarSourceOptions);
  start(onFrame: (frame: RadarFrame) => void): void;
  stop(): void;
}
export class ReplaySource extends MockSource { readonly kind: 'replay'; }
export class BridgeSource implements RadarSource {
  readonly kind: 'bridge'; readonly fps: number; readonly rangeBins: number; readonly dopplerBins: number; readonly frameSize: number; readonly connected: boolean;
  constructor(options?: RadarSourceOptions);
  start(onFrame: (frame: RadarFrame) => void): void;
  stop(): void;
}
export class AcousticSource implements RadarSource {
  readonly kind: 'acoustic'; readonly fps: number; readonly rangeBins: number; readonly dopplerBins: number; readonly frameSize: number; readonly connected: boolean;
  constructor(options?: RadarSourceOptions);
  start(onFrame: (frame: RadarFrame) => void): Promise<void>;
  stop(): void;
}
export class PassiveSource implements RadarSource {
  readonly kind: 'passive'; readonly fps: number; readonly rangeBins: number; readonly dopplerBins: number; readonly frameSize: number;
  constructor(options?: RadarSourceOptions);
  start(onFrame: (frame: RadarFrame) => void): void;
  stop(): void;
}
export function makeSource(kind: RadarMode | 'satellite' | string, options?: RadarSourceOptions): RadarSource;
