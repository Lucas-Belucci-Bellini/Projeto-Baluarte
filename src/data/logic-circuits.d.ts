export type LogicCell = string | number;
export interface LogicTruthTable { readonly headers: readonly string[]; readonly rows: readonly (readonly LogicCell[])[]; }
export interface FundamentalGate { readonly id: string; readonly name: string; readonly symbol: string; readonly inputs: number; readonly expr: string; readonly desc: string; readonly truth: LogicTruthTable; readonly universal: boolean; }
export interface BuildingBlock { readonly id: string; readonly name: string; readonly kind: 'Combinacional' | 'Sequencial'; readonly expr: string; readonly desc: string; readonly truth: LogicTruthTable; }
export interface LogicChip { readonly code: string; readonly name: string; readonly pins: number; }
export interface ChipFamily { readonly family: string; readonly note: string; readonly chips: readonly LogicChip[]; }
export interface LogicStats { readonly gates: number; readonly blocks: number; readonly chips: number; }
export const FUNDAMENTAL_GATES: readonly FundamentalGate[];
export const BUILDING_BLOCKS: readonly BuildingBlock[];
export const CHIP_FAMILIES: readonly ChipFamily[];
export const LOGIC_STATS: LogicStats;
