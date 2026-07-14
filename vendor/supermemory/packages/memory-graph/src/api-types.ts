export type MemoryRelation = "updates" | "extends" | "derives"

export interface MemoryEntry {
	id: string
	memory: string
	content?: string | null
	createdAt: string
	updatedAt: string
	spaceId?: string | null
	embedding?: number[]
	isStatic?: boolean
	isForgotten?: boolean
	forgetAfter?: string | null
	forgetReason?: string | null
	version?: number
	parentMemoryId?: string | null
	rootMemoryId?: string | null
	isLatest?: boolean
	// Relation fields from backend
	relation?: MemoryRelation | null
	updatesMemoryId?: string | null
	nextVersionId?: string | null
	memoryRelations?: Record<string, MemoryRelation> | null
	// Source/join fields
	sourceAddedAt?: string | null
	sourceRelevanceScore?: number | null
	sourceMetadata?: Record<string, unknown> | null
	spaceContainerTag?: string | null
}

export interface DocumentWithMemories {
	id: string
	title: string | null
	url: string | null
	documentType: string
	createdAt: string
	updatedAt: string
	summary?: string | null
	memories: MemoryEntry[]
}

export interface DocumentsResponse {
	documents: DocumentWithMemories[]
	pagination: {
		currentPage: number
		limit: number
		totalItems: number
		totalPages: number
	}
}
