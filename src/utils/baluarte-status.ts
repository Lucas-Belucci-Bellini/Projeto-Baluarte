export type StatusPrimitive = string | number | boolean | null;
export type StatusValue =
  | StatusPrimitive
  | readonly StatusValue[]
  | { readonly [key: string]: StatusValue };

export interface BaluarteStatusState {
  funcaoAtual: string | null;
  [key: string]: StatusValue | undefined;
}

declare global {
  interface Window {
    BaluarteStatus?: BaluarteStatusState;
  }
}

const state: BaluarteStatusState = {
  funcaoAtual: null
};

if (typeof window !== 'undefined') {
  window.BaluarteStatus = state;
}

function isRecord(value: StatusValue): value is { readonly [key: string]: StatusValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue(value: StatusValue): StatusValue {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isRecord(value)) {
    const copy: Record<string, StatusValue> = {};
    Object.entries(value).forEach(([key, nested]) => {
      copy[key] = cloneValue(nested);
    });
    return copy;
  }
  return value;
}

export function setStatus(key: string, summary: StatusValue): void {
  if (!key) return;
  state[key] = isRecord(summary) ? { ...summary } : { value: summary };
}

export function clearStatus(key: string): void {
  if (key in state) delete state[key];
}

export function setCurrentFunction(route?: string | null): void {
  state.funcaoAtual = route || null;
}

export function getStatusSnapshot(): BaluarteStatusState {
  const snapshot: BaluarteStatusState = { funcaoAtual: null };
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined) snapshot[key] = cloneValue(value);
  });
  return snapshot;
}

export function getStatusText(): string {
  try {
    return JSON.stringify(getStatusSnapshot(), null, 2) ?? '{}';
  } catch {
    return '{}';
  }
}
