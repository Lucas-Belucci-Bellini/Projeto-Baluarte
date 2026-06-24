export interface ChatMemoryCard {
	documentId?: string
	title?: string
	content?: string
	url?: string
	score?: number
}

function normalizeMetadata(
	metadata: unknown,
): Record<string, unknown> | undefined {
	if (!metadata || typeof metadata !== "object") return undefined
	return metadata as Record<string, unknown>
}

function normalizeOne(raw: unknown): ChatMemoryCard {
	if (!raw || typeof raw !== "object") return {}
	const r = raw as Record<string, unknown>
	const meta = normalizeMetadata(r.metadata)

	const bodyText =
		(typeof r.content === "string" && r.content) ||
		(typeof r.memory === "string" && r.memory) ||
		(typeof r.chunk === "string" && r.chunk) ||
		""

	const titleFromMeta =
		(meta && typeof meta.title === "string" && meta.title) ||
		(meta && typeof meta.name === "string" && meta.name) ||
		undefined

	const docs = Array.isArray(r.documents) ? r.documents : []
	const firstDoc = docs[0] as Record<string, unknown> | undefined
	const docTitle =
		firstDoc && typeof firstDoc.title === "string" ? firstDoc.title : undefined

	const explicitTitle =
		typeof r.title === "string" && r.title.trim() ? r.title.trim() : undefined

	const title = explicitTitle || titleFromMeta || docTitle || undefined

	const url =
		(typeof r.url === "string" && r.url) ||
		(meta && typeof meta.url === "string" ? meta.url : undefined) ||
		(meta && typeof meta.sourceUrl === "string" ? meta.sourceUrl : undefined)

	const score =
		typeof r.score === "number"
			? r.score
			: typeof r.similarity === "number"
				? r.similarity
				: undefined

	const documentId =
		(typeof r.documentId === "string" && r.documentId) ||
		(typeof r.id === "string" && r.id) ||
		undefined

	return {
		documentId,
		title,
		content: bodyText || undefined,
		url,
		score,
	}
}

/** Normalizes searchMemories tool output (v4 API shape or legacy chunk-search shape). */
export function memoryResultsFromSearchToolOutput(
	output: unknown,
): ChatMemoryCard[] {
	if (!output || typeof output !== "object") return []
	const o = output as { results?: unknown }
	if (!Array.isArray(o.results)) return []
	return o.results.map(normalizeOne)
}

/**
 * Avoid showing the same text twice when title was a truncated copy of content
 * or legacy payloads duplicated both fields.
 */
export function getMemoryCardDisplay(result: ChatMemoryCard): {
	title?: string
	body: string
} {
	const content = (result.content ?? "").trim()
	const titleRaw = (result.title ?? "").trim()
	if (!content && titleRaw) return { body: titleRaw }
	if (!titleRaw) return { body: content }
	if (titleRaw === content) return { body: content }
	const base = titleRaw.endsWith("…")
		? titleRaw.slice(0, -1).trimEnd()
		: titleRaw
	if (base.length > 0 && content.startsWith(base)) return { body: content }
	return { title: titleRaw, body: content }
}
