"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ExpandableTagsProps {
	tags: string[];
	limit?: number;
	tagClassName?: string;
	className?: string;
}

export function ExpandableTags({
	tags,
	limit = 3,
	tagClassName,
	className,
}: ExpandableTagsProps) {
	const [expanded, setExpanded] = React.useState(false);

	if (tags.length === 0) return null;

	const visibleTags = expanded ? tags : tags.slice(0, limit);
	const hiddenCount = tags.length - limit;

	return (
		<div className={cn("flex flex-wrap gap-1", className)}>
			{visibleTags.map((tag) => (
				<span
					key={tag}
					className={cn(
						"inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-medium text-[9px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
						tagClassName,
					)}
				>
					{tag}
				</span>
			))}
			{hiddenCount > 0 && (
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
			)}
		</div>
	);
}
