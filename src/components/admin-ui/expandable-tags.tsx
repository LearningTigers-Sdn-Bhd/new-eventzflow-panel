"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ExpandableTagsProps {
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
