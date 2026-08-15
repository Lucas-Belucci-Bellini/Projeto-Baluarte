export type NucleoEventType = 'telemetry' | 'biometric' | 'command' | 'system' | 'voice';

export interface NucleoEvent {
  readonly type: NucleoEventType;
  readonly source?: string;
  readonly payload?: unknown;
  readonly ts?: number | string;
}

export interface NucleoStatus {
  readonly connected: boolean;
  readonly url?: string;
  readonly detail?: string;
}

export function getNucleoUrl(): string;
export function setNucleoUrl(url: string): string;
export function setNucleoToken(token: string): void;
export function initNucleoLink(): void;
export function simulateNucleoEvent(type?: NucleoEventType, payload?: unknown): void;
