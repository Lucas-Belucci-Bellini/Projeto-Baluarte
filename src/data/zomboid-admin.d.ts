export interface PzCommand { readonly cmd: string; readonly fn: string; readonly ex: string; readonly danger?: boolean; }
export interface PzCategory { readonly label: string; readonly icon: string; }
export interface PzId { readonly name: string; readonly author: string; readonly cat: string; readonly modId: string; readonly workshopId: string; readonly spawnId: string; }
export const PZ_COMMANDS: readonly PzCommand[];
export const PZ_ACCESS_LEVELS: readonly string[];
export const PZ_CATS: Readonly<Record<string, PzCategory>>;
export const PZ_IDS: readonly PzId[];
