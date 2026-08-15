export function nexusEvent(tipo: string, payload?: Readonly<Record<string, unknown>>): Promise<unknown>;
export function nexusStat(metrica: string, valor: number, dimensoes?: Readonly<Record<string, unknown>>): Promise<unknown>;
export function nexusMemory(texto: string, tags?: readonly string[]): Promise<unknown>;
export function initNexusTelemetry(): void;
