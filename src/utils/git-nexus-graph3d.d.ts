import type { NexusEdge, NexusNode } from './git-nexus-engine.js';

export interface GraphView3D {
  start(): void;
  stop(): void;
  select(id: string | null): void;
  reheat(): void;
  destroy(): void;
}

export interface GraphView3DOptions {
  nodes: readonly NexusNode[];
  edges: readonly NexusEdge[];
  comIdx: ReadonlyMap<string, number>;
  pr: ReadonlyMap<string, number>;
  onSelect?: (id: string | null) => void;
}

export function createGraphView3D(canvas: HTMLCanvasElement, options: GraphView3DOptions): GraphView3D;
