"use client"

import { cn } from "@lib/utils"
import {
	type ChatMemoryCard,
	getMemoryCardDisplay,
} from "@/lib/chat-search-memory-results"
import { dmSansClassName } from "@/lib/fonts"

type CardTone = "sidebar" | "input"

function RelevancyScore({ score }: { score: number }) {
	return (
		<div
			className={cn(
				"flex shrink-0 justify-center pt-2 pb-1.5",
				dmSansClassName(),
			)}
		>
			<span
				className={cn(
					"text-[10px] font-medium text-transparent bg-clip-text",
					dmSansClassName(),
				)}
				style={{
					backgroundImage:
						"var(--grad-1, linear-gradient(94deg, #369BFD 4.8%, #36FDFD 77.04%, #36FDB5 143.99%))",
				}}
			>
				Relevancy score: {(score * 100).toFixed(1)}%
			</span>
		</div>
	)
}

export function MemorySearchResultCard({
	result,
	tone,
}: {
	result: ChatMemoryCard
	tone: CardTone
}) {
	const { title, body } = getMemoryCardDisplay(result)
	const isClickable =
		result.url &&
		(result.url.startsWith("http://") || result.url.startsWith("https://"))

	const textBlock = (
		<div className="min-h-0 flex-1 rounded-lg bg-[#060D17] p-2">
			{title ? (
				<div className="mb-1 line-clamp-1 text-xs font-medium text-[#525D6E]/90">
					{title}
				</div>
			) : null}
			<div
				className={cn(
					"line-clamp-3 text-xs text-[#525D6E]",
					tone === "input" && "text-[#525D6E]/80",
				)}
			>
				{body || "—"}
			</div>
			{result.url ? (
				<div className="mt-1 truncate text-xs text-[#525D6E]">{result.url}</div>
			) : null}
		</div>
	)

	const column = (
		<>
			{textBlock}
			{result.score != null ? <RelevancyScore score={result.score} /> : null}
		</>
	)

	if (isClickable) {
		const linkClass =
			tone === "sidebar"
				? "flex h-full min-h-0 flex-col rounded-md border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
				: "flex h-full min-h-0 flex-col rounded-md border border-[#525D6E]/20 bg-[#0C1829]/50 p-2 transition-colors hover:bg-[#0C1829]/70"

		return (
			<a
				className={cn(linkClass, "cursor-pointer")}
				href={result.url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{column}
			</a>
		)
	}

	const solidClass =
		tone === "sidebar"
			? cn(
					"flex h-full min-h-0 flex-col rounded-xl bg-[#0C1829] p-1",
					dmSansClassName(),
				)
			: "flex h-full min-h-0 flex-col rounded-xl bg-[#0C1829] p-1"

	return <div className={solidClass}>{column}</div>
}
