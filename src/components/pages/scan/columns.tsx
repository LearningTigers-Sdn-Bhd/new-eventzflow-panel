"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-helpers";
import type { ScanResult } from "./types";

export const columns: ColumnDef<ScanResult>[] = [
	{
		id: "index",
		size: 48,
		header: () => <div className="text-center text-xs sm:text-sm">No</div>,
		cell: ({ row, table }) => {
			// Get index from filtered/sorted rows
			const allRows = table.getRowModel().rows;
			const index = allRows.findIndex((r) => r.id === row.id);
			return (
				<div className="w-12 py-2 text-center font-mono text-[10px] text-muted-foreground sm:py-3 sm:text-xs">
					{index >= 0 ? index + 1 : ""}
				</div>
			);
		},
	},
	{
		accessorKey: "attendeeName",
		size: 100,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium text-xs sm:text-sm">Attendee</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
					>
						<ArrowDown
							className={cn(
								"size-3.5 transition-transform sm:size-4",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const { copyToClipboard } = useCopyToClipboard({
				successMessage: "Ticket ID copied to clipboard",
			});
			const ticketId = row.original.ticketId;

			return (
				<div className="min-w-[100px] py-2 sm:py-3">
					<div className="truncate font-medium text-xs sm:text-sm">
						{row.getValue("attendeeName") || "Unknown"}
					</div>
					{ticketId && (
						<div className="mt-1 flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="group rounded-none p-0! hover:bg-transparent"
								onClick={() => copyToClipboard(ticketId)}
							>
								<span className="font-mono text-[10px] text-muted-foreground group-hover:underline sm:text-xs">
									{ticketId}
								</span>
								<Copy className="ml-2 size-3 sm:size-3.5" />
							</Button>
						</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "eventName",
		size: 120,
		filterFn: (row, _id, value) => {
			if (value === undefined || value === "all") return true;
			return row.original.eventId?.toString() === value;
		},
		header: ({ column }) => {
			return (
				<div className="hidden items-center gap-2 md:flex">
					<p className="font-medium text-xs sm:text-sm">Event</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
					>
						<ArrowDown
							className={cn(
								"size-3.5 transition-transform sm:size-4",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="hidden truncate py-2 text-muted-foreground text-xs sm:py-3 sm:text-sm md:table-cell">
				<span className="max-w-[120px] text-wrap">
					{row.getValue("eventName") || "-"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "ticketType",
		size: 100,
		header: () => (
			<div className="hidden font-medium text-xs sm:table-cell sm:text-sm">
				Ticket Type
			</div>
		),
		cell: ({ row }) => (
			<div className="hidden min-w-[100px] truncate py-2 text-muted-foreground text-xs sm:table-cell sm:py-3 sm:text-sm">
				{row.getValue("ticketType") || "-"}
			</div>
		),
	},
	{
		accessorKey: "timestamp",
		size: 140,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="whitespace-nowrap font-medium text-xs sm:text-sm">
						Check-In Time
					</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
					>
						<ArrowDown
							className={cn(
								"size-3.5 transition-transform sm:size-4",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const timestamp = row.getValue("timestamp") as Date;
			return (
				<div className="whitespace-nowrap py-2 text-[10px] text-muted-foreground sm:py-3 sm:text-sm">
					{timestamp.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					})}
				</div>
			);
		},
		sortingFn: (rowA, rowB) => {
			const dateA = (rowA.getValue("timestamp") as Date).getTime();
			const dateB = (rowB.getValue("timestamp") as Date).getTime();
			return dateA - dateB;
		},
	},
	{
		accessorKey: "status",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium text-xs sm:text-sm">Status</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
					>
						<ArrowDown
							className={cn(
								"size-3.5 transition-transform sm:size-4",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const result = row.original;
			return (
				<div className="min-w-[150px] py-2 sm:py-3">
					<StatusBadge
						status={result.status}
						message={result.message}
						className="rounded-none"
					/>
				</div>
			);
		},
		sortingFn: (rowA, rowB) => {
			const statusA = rowA.getValue("status") as string;
			const statusB = rowB.getValue("status") as string;
			return statusA.localeCompare(statusB);
		},
	},
];
