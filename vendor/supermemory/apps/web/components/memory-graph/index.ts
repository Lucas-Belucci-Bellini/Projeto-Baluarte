// Re-export the wrapper as MemoryGraph (same name, drop-in replacement)
export { MemoryGraph } from "./memory-graph-wrapper"
export type { MemoryGraphWrapperProps as MemoryGraphProps } from "./memory-graph-wrapper"

// Keep GraphCard (app-specific)
export { GraphCard } from "./graph-card"
export type { GraphCardProps } from "./graph-card"

// Re-export useful types from the package
export type {
	GraphNode,
	GraphEdge,
	GraphApiDocument,
	GraphApiMemory,
} from "@supermemory/memory-graph"

// Keep the API hook export
export { useGraphApi } from "./hooks/use-graph-api"
