"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Stable per-tag pastel colour (same fills as the status badges elsewhere).
const TAG_COLORS = [
	"border-blue-200 bg-blue-100 text-blue-800",
	"border-green-200 bg-green-100 text-green-800",
	"border-purple-200 bg-purple-100 text-purple-800",
	"border-amber-200 bg-amber-100 text-amber-800",
	"border-pink-200 bg-pink-100 text-pink-800",
	"border-cyan-200 bg-cyan-100 text-cyan-800",
];

function tagColor(tag: string) {
	let hash = 0;
	for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
	return TAG_COLORS[hash % TAG_COLORS.length];
}

interface ExpandableTagsProps {
	// Colour each tag by its text instead of the default indigo.
	colorful?: boolean;
	tags: string[];
	limit?: number;
	tagClassName?: string;
	className?: string;
	// Keeps everything on one line (no wrap, no expand-in-place toggle) —
	// just the first `limit` tags plus a static "+N" badge. Used where
	// space is tight, e.g. the mobile session card.
	singleRow?: boolean;
}

export function ExpandableTags({
	tags,
	limit = 3,
	tagClassName,
	className,
	singleRow = false,
	colorful = false,
}: ExpandableTagsProps) {
	const [expanded, setExpanded] = React.useState(false);

	if (tags.length === 0) return null;

	const visibleTags = singleRow || !expanded ? tags.slice(0, limit) : tags;
	const hiddenCount = tags.length - limit;

	return (
		<div
			className={cn(
				"flex gap-1",
				singleRow ? "flex-nowrap overflow-hidden" : "flex-wrap",
				className,
			)}
		>
			{visibleTags.map((tag) => (
				<span
					key={tag}
					className={cn(
						"inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-medium text-[9px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
						colorful && cn("rounded-none", tagColor(tag)),
						singleRow && "shrink-0",
						tagClassName,
					)}
				>
					{tag}
				</span>
			))}
			{hiddenCount > 0 &&
				(singleRow ? (
					<span className="inline-flex shrink-0 items-center rounded-full border border-muted-foreground/30 border-dashed px-2 py-0.5 font-medium text-[9px] text-muted-foreground">
						+{hiddenCount}
					</span>
				) : (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setExpanded((prev) => !prev);
						}}
						className="inline-flex items-center rounded-full border border-muted-foreground/30 border-dashed px-2 py-0.5 font-medium text-[9px] text-muted-foreground transition-colors hover:bg-muted/50"
					>
						{expanded ? "Show less" : `+${hiddenCount}`}
					</button>
				))}
		</div>
	);
}
