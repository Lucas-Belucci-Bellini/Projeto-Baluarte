export type GuardLevel = 'safe' | 'caution' | 'block';
export interface GuardLogEntry { readonly tool: string; readonly level: GuardLevel; readonly reason: string; readonly ts: number; }
export interface GuardStats { readonly total: number; readonly safe: number; readonly caution: number; readonly block: number; }
export interface GuardDecision { readonly level: GuardLevel; readonly reason: string; readonly tool: string; }
export const TOOL_LEVEL: Readonly<Record<string, GuardLevel>>;
export function guardEnabled(): boolean;
export function setGuardEnabled(enabled: boolean): void;
export function evaluateToolCall(name: string, input: unknown): GuardDecision;
export function logDecision(entry: GuardDecision): void;
export function getGuardLog(): readonly GuardLogEntry[];
export function clearGuardLog(): void;
export function guardStats(): GuardStats;
