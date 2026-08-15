export type PeriodicGroup = number | 'L' | 'A';
export type PeriodicCategory = 'alkali' | 'alkaline' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide' | 'unknown';
export interface PeriodicCategoryInfo { readonly label: string; readonly color: string; }
export interface PeriodicElement { readonly z: number; readonly symbol: string; readonly name: string; readonly mass: number; readonly group: PeriodicGroup; readonly period: number; readonly category: PeriodicCategory; }
export const CATEGORIES_PT: Readonly<Record<PeriodicCategory, PeriodicCategoryInfo>>;
export const ELEMENTS: readonly PeriodicElement[];
export const TOTAL_ELEMENTS: number;
export function findElement(z: number): PeriodicElement | null;
export function electronConfig(z: number): string;
