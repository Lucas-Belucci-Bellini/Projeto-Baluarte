export function nexusEvent(tipo: string, payload?: Readonly<Record<string, unknown>>): Promise<void>;
export function nexusStat(tipo: string, payload?: Readonly<Record<string, unknown>>): Promise<void>;
export function nexusMemory(payload: Readonly<Record<string, unknown>>): Promise<void>;
export function initNexusTelemetry(): void;
