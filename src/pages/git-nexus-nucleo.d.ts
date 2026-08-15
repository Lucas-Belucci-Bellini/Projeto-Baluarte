export interface GitNexusGateArgs { readonly query?: Readonly<Record<string, string | undefined>>; readonly tab?: string; }
export function gitNexusNucleo(args: GitNexusGateArgs): HTMLElement;
