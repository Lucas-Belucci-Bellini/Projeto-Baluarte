export interface SiteCapability {
  readonly path: string;
  readonly label: string;
  readonly group: string;
  readonly desc: string;
}

export const CAPABILITIES: readonly SiteCapability[];
export function capabilitiesText(): string;
export function findCapability(query: string): { path: string; label: string } | null;
