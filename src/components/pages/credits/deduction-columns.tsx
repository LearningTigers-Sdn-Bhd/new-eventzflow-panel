"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFormatDate } from "@/hooks/use-format-date";
import type { CreditDeduction } from "@/lib/api/credits";
import { cn } from "@/lib/utils";

export const deductionColumns: ColumnDef<CreditDeduction>[] = [
	{
		accessorKey: "event",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Event</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
		},
		cell: ({ row }) => {
			return <div className="font-medium">{row.getValue("event")}</div>;
		},
	},
	{
		accessorKey: "recipient",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Recipient</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
		},
		cell: ({ row }) => {
			return (
				<div className="font-mono text-sm">{row.getValue("recipient")}</div>
			);
		},
	},
	{
		accessorKey: "channel",
		size: 150,
		header: () => {
			return <p className="font-medium">Channel</p>;
		},
		cell: ({ row }) => {
			return <div className="text-sm">{row.getValue("channel")}</div>;
		},
	},
	{
		accessorKey: "credits",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Credits</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
		},
		cell: ({ row }) => {
			const credits = row.getValue("credits") as number;
			return <div className="font-semibold text-red-600">{credits}</div>;
		},
	},
	{
		accessorKey: "status",
		size: 120,
		header: () => {
			return <p className="font-medium">Status</p>;
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={
						status === "sent"
							? "default"
							: status === "failed"
								? "destructive"
								: "secondary"
					}
					className="capitalize"
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "date",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Date</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("date"));
			const { formatDate } = useFormatDate();
			return <div className="text-sm">{formatDate(date)}</div>;
		},
	},
];
