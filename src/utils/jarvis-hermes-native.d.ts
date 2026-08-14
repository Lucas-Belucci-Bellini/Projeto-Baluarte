export interface NativeHermesMessage {
  readonly role: string;
  readonly text?: string;
  readonly content?: string;
}

export interface NativeHermesPrompt {
  readonly system?: string;
  readonly messages?: readonly NativeHermesMessage[];
}

export interface NativeHermesStatus {
  readonly available: boolean;
  readonly downloading?: boolean;
  readonly pct?: number;
  readonly model?: string;
  readonly backend?: string;
  readonly fatal?: boolean;
  readonly engine?: string;
  readonly reason?: string;
  readonly code?: string;
  readonly hint?: string;
  readonly [key: string]: unknown;
}

export type NativeHermesBrain = (prompt: NativeHermesPrompt) => Promise<string>;

export function nativeHermesStatus(): Promise<NativeHermesStatus>;
export function makeNativeBrain(): NativeHermesBrain;
