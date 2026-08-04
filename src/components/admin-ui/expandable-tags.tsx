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
						"inline-flex items-center rounded bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-primary border border-primary/10",
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
					className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
				>
					{expanded ? "Show less" : `+${hiddenCount}`}
				</button>
			)}
		</div>
	);
}
