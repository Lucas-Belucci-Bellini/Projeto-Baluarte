export type StatusPrimitive = string | number | boolean | null;
export type StatusValue =
  | StatusPrimitive
  | readonly StatusValue[]
  | { readonly [key: string]: StatusValue };

export interface BaluarteStatusState {
  funcaoAtual: string | null;
  [key: string]: StatusValue | undefined;
}

export function setStatus(key: string, summary: StatusValue): void;
export function clearStatus(key: string): void;
export function setCurrentFunction(route?: string | null): void;
export function getStatusSnapshot(): BaluarteStatusState;
export function getStatusText(): string;
