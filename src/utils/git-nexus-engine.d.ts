export interface NexusNode {
  readonly id: string;
  readonly label: string;
  readonly dir: string;
  readonly loc: number;
  readonly imports: number;
  readonly importedBy: number;
  readonly kind?: string;
  readonly file?: string;
  readonly line?: number;
}

export interface NexusEdge {
  readonly source: string;
  readonly target: string;
  readonly type?: string;
}

export interface NexusCodemap {
  readonly nodes: readonly NexusNode[];
  readonly links: readonly NexusEdge[];
  readonly meta?: Readonly<Record<string, unknown>>;
  readonly focusFile?: string;
  readonly focusIds?: ReadonlySet<string>;
}

export interface NexusGraph {
  readonly nodes: NexusNode[];
  readonly edges: NexusEdge[];
  readonly index: Map<string, NexusNode>;
  readonly out: Map<string, string[]>;
  readonly inc: Map<string, string[]>;
}

export interface NexusCommunity {
  readonly size: number;
  readonly members: NexusNode[];
  readonly domDir: string;
  readonly top: string[];
}

export interface NexusCentrality {
  readonly id: string;
  readonly label: string;
  readonly score: number;
}

export interface NexusMetrics {
  readonly files: number;
  readonly imports: number;
  readonly communities: number;
  readonly totalLoc: number;
  readonly orphans: number;
  readonly central: NexusCentrality[];
  readonly mostDepended: NexusNode[];
}

export interface NexusAnalysis {
  readonly graph: NexusGraph;
  readonly communities: NexusCommunity[];
  readonly comIdx: Map<string, number>;
  readonly pr: Map<string, number>;
  readonly metrics: NexusMetrics;
}

export interface NexusImpact {
  readonly affected: string[];
  readonly direct: string[];
}

export interface NexusRisk {
  readonly label: string;
  readonly cls: string;
}

export interface NexusImpactResult extends NexusImpact {
  readonly risk: NexusRisk;
}

export interface NexusContext {
  readonly node: NexusNode;
  readonly callers: string[];
  readonly callees: string[];
}

export interface NexusSymbolMap extends NexusCodemap {
  readonly meta?: {
    readonly symbols?: number;
    readonly calls?: number;
    readonly byKind?: Readonly<Record<string, number>>;
    readonly [key: string]: unknown;
  };
}

export function fromEngineGraph(value: unknown): NexusCodemap;
export function buildGraph(codemap: NexusCodemap): NexusGraph;
export function analyze(codemap: NexusCodemap): NexusAnalysis;
export function impactOf(graph: NexusGraph, id: string, options?: { maxDepth?: number }): NexusImpact;
export function dependenciesOf(graph: NexusGraph, id: string): string[];
export function search(graph: NexusGraph, query: string): NexusNode[];
export function nexusContext(graph: NexusGraph, id: string): NexusContext | null;
export function nexusImpact(graph: NexusGraph, id: string, direction?: 'up' | 'down'): NexusImpactResult;
export function nexusPath(graph: NexusGraph, from: string, to: string): string[] | null;
export function nexusRename(graph: NexusGraph, id: string): string[];
export function riskLevel(size: number): NexusRisk;
export function symbolSubmap(symbolMap: NexusSymbolMap, cap?: number): NexusSymbolMap;
export function fileSymbolGraph(symbolMap: NexusSymbolMap, fileId: string, cap?: number): NexusSymbolMap;
