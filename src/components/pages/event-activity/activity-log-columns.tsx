"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventActivityRecord } from "@/lib/api/event-activity-log";
import { getActivityCategoryClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";

const WHAT_CHANGED_PREVIEW_LIMIT = 2;

export function WhatChanged({ log }: { log: EventActivityRecord }) {
	const changes = log.details?.changes;
	const entries = changes ? Object.entries(changes) : [];
	if (entries.length === 0) {
		return <span className="text-muted-foreground text-xs">—</span>;
	}
	const shown = entries.slice(0, WHAT_CHANGED_PREVIEW_LIMIT);
	const remaining = entries.length - shown.length;
	return (
		<div className="max-w-[280px] space-y-0.5 text-xs">
			{shown.map(([field, change]) => (
				<div
					key={field}
					className="truncate"
					title={`${field}: ${change.from} → ${change.to}`}
				>
					<span className="font-medium">{field}:</span> {change.from} →{" "}
					{change.to}
				</div>
			))}
			{remaining > 0 && (
				<div className="text-muted-foreground">
					+{remaining} more — click to view
				</div>
			)}
		</div>
	);
}

export function UnusualBadge() {
	return (
		<Badge
			variant="outline"
			className="gap-1 rounded-none border-amber-600 text-[10px] text-amber-700 dark:text-amber-500"
		>
			<AlertTriangle className="size-3" />
			Unusual
		</Badge>
	);
}

export function ResultBadge({ log }: { log: EventActivityRecord }) {
	if (log.result === "failed") {
		return (
			<Badge
				variant="outline"
				className="rounded-none border-destructive text-[10px] text-destructive"
			>
				Failed
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="rounded-none border-emerald-600 text-[10px] text-emerald-700 dark:text-emerald-500"
		>
			Success
		</Badge>
	);
}

export function generateActivityLogColumns(): ColumnDef<EventActivityRecord>[] {
	return [
		{
			accessorKey: "created_at",
			size: 160,
			header: "Date & Time",
			cell: ({ row }) => (
				<div className="flex flex-col whitespace-nowrap">
					<span className="font-semibold text-sm">
						{format(new Date(row.original.created_at), "h:mm:ss a")}
					</span>
					<span className="text-muted-foreground text-xs">
						{format(new Date(row.original.created_at), "dd MMM yyyy")}
					</span>
				</div>
			),
		},
		{
			accessorKey: "user",
			size: 180,
			header: "User",
			cell: ({ row }) => (
				<div className="text-xs">
					<div className="font-medium">{row.original.user.full_name}</div>
					<div className="text-muted-foreground">{row.original.user.email}</div>
				</div>
			),
		},
		{
			accessorKey: "action_name",
			size: 200,
			header: "Action",
			cell: ({ row }) => (
				<div className="flex flex-col items-start gap-1">
					<span className="font-semibold text-xs">
						{row.original.action_name}
					</span>
					{row.original.unusual && <UnusualBadge />}
				</div>
			),
		},
		{
			accessorKey: "category",
			size: 140,
			header: "Category",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={cn(
						"rounded-none text-[10px] capitalize",
						getActivityCategoryClass(row.original.category),
					)}
				>
					{row.original.category.replace(/_/g, " ")}
				</Badge>
			),
		},
		{
			id: "changes",
			size: 280,
			header: "What Changed",
			cell: ({ row }) => <WhatChanged log={row.original} />,
		},
		{
			accessorKey: "result",
			size: 100,
			header: "Result",
			cell: ({ row }) => <ResultBadge log={row.original} />,
		},
	];
}
