import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { UIMessage } from "@ai-sdk/react"
import {
	type ChatMemoryCard,
	memoryResultsFromSearchToolOutput,
} from "@/lib/chat-search-memory-results"
import { MemorySearchResultCard } from "./memory-search-result-card"
import { dmSansClassName } from "@/lib/fonts"
import { cn } from "@lib/utils"

interface RelatedMemoriesProps {
	message: UIMessage
	expandedMemories: string | null
	onToggle: (messageId: string) => void
}

export function RelatedMemories({
	message,
	expandedMemories,
	onToggle,
}: RelatedMemoriesProps) {
	const memoryResults: ChatMemoryCard[] = []

	message.parts.forEach((part) => {
		if (
			part.type === "tool-searchMemories" &&
			part.state === "output-available"
		) {
			memoryResults.push(...memoryResultsFromSearchToolOutput(part.output))
		}
	})

	if (memoryResults.length === 0) {
		return null
	}

	const isExpanded = expandedMemories === message.id

	return (
		<div className="mb-2">
			<button
				type="button"
				className={cn(
					"flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors text-sm",
					dmSansClassName(),
				)}
				onClick={() => onToggle(message.id)}
			>
				Related memories
				{isExpanded ? (
					<ChevronUpIcon className="size-3.5" />
				) : (
					<ChevronDownIcon className="size-3.5" />
				)}
			</button>

			{isExpanded && (
				<div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto items-stretch">
					{memoryResults.map((result, idx) => (
						<MemorySearchResultCard
							key={result.documentId ?? idx}
							result={result}
							tone="sidebar"
						/>
					))}
				</div>
			)}
		</div>
	)
}
