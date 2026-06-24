export function isWebSearchToolName(name: string): boolean {
	const n = name.toLowerCase()
	return (
		n === "web_search" ||
		n === "google_search" ||
		n.includes("web_search") ||
		n === "websearch"
	)
}
