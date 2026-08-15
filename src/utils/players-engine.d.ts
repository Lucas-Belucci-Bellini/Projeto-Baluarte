export interface PlayerSummary {
  readonly name: string;
  readonly key: string;
  readonly points: number;
  readonly xp: number;
  readonly plays: number;
  readonly level: number;
  readonly patente: string;
  readonly xpInto: number;
  readonly xpSpan: number;
  readonly xpPct: number;
  readonly xpNext: number;
}
export interface ScoreRecord { readonly score: number; readonly max: number; readonly at: number; }
export interface ScoreAward { readonly leveledUp: boolean; readonly level: number; readonly patente: string; readonly gained: number; }
export interface SaveBlob { readonly index?: number; readonly score?: number; readonly mode?: string; readonly [key: string]: unknown; }
export interface LeaderboardEntry extends PlayerSummary {}
export function currentKey(): string | null;
export function current(): PlayerSummary | null;
export function isLoggedIn(): boolean;
export function logout(): void;
export function exists(name: string): boolean;
export function register(name: string, password: string): Promise<PlayerSummary>;
export function login(name: string, password: string): Promise<PlayerSummary>;
export function awardScore(gameId: string, score: number, max: number): ScoreAward | null;
export function bestScore(gameId: string): ScoreRecord | null;
export function saveProgress(gameId: string, blob: SaveBlob): boolean;
export function loadProgress(gameId: string): SaveBlob | null;
export function clearProgress(gameId: string): void;
export function leaderboard(): LeaderboardEntry[];
