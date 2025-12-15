"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableHeaderProps<TData = unknown> {
	column: Column<TData, unknown>;
	label: string;
	className?: string;
	buttonClassName?: string;
}

/**
 * Reusable sortable column header component
 * Displays a label with a sort button that toggles between ascending/descending
 */
export function SortableHeader<TData = unknown>({
	column,
	label,
	className,
	buttonClassName,
}: SortableHeaderProps<TData>) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<p className="font-medium">{label}</p>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className={cn("rounded-none hover:border", buttonClassName)}
			>
				<ArrowDown
					className={cn(
						"size-4 transition-transform",
						column.getIsSorted() === "asc" && "-rotate-180",
					)}
				/>
			</Button>
		</div>
	);
}
