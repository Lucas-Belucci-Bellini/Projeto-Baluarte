export type FftRenderMode =
  | 'bars'
  | 'line'
  | 'waveform'
  | 'radial'
  | 'spectrogram'
  | 'particles'
  | 'mirror'
  | 'blob'
  | 'vu'
  | 'lissajous'
  | 'rings'
  | 'waterfall'
  | 'dual'
  | 'dots'
  | 'terrain'
  | 'bloom';

export interface FftRenderModeInfo {
  readonly id: FftRenderMode;
  readonly label: string;
  readonly icon: string;
}

export const RENDER_MODES: readonly FftRenderModeInfo[];
export function connectMicrophone(): Promise<boolean>;
export function connectSystemAudio(): Promise<boolean>;
export function connectMediaElement(element: HTMLAudioElement): HTMLAudioElement;
export function connectTestTone(frequency?: number): Promise<OscillatorNode>;
export function setTestFrequency(frequency: number): void;
export function disconnect(): void;
export function setMode(mode: FftRenderMode): void;
export function setFftSize(size: number): void;
export function setSmoothing(value: number): void;
export function setGain(value: number): void;
export function startRender(canvas: HTMLCanvasElement, options?: Readonly<Record<string, unknown>>): void;
export function stopRender(): void;
export function onStreamEnded(callback: (type: 'mic' | 'system') => void): void;
