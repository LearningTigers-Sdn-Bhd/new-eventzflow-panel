"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { StatusBadge, TypeBadge } from "../status-helpers";
import type { ScanResult } from "../types";

export function generateColumns(): ColumnDef<ScanResult>[] {
	return [
		{
			id: "index",
			size: 48,
			header: () => <div className="text-center text-xs sm:text-sm">No</div>,
			cell: ({ row, table }) => {
				// Get absolute row number across all pages
				const pageIndex = table.getState().pagination.pageIndex;
				const pageSize = table.getState().pagination.pageSize;
				const rowIndexInPage = row.index;
				const absoluteIndex = pageIndex * pageSize + rowIndexInPage + 1;
				return (
					<div className="w-12 py-2 text-center font-mono text-[10px] text-muted-foreground sm:py-3 sm:text-xs">
						{absoluteIndex}
					</div>
				);
			},
		},
		{
			accessorKey: "name",
			size: 100,
			header: ({ column }) => {
				return (
					<SortableHeader
						column={column}
						label="Attendee"
						className="text-xs sm:text-sm"
					/>
				);
			},
			cell: ({ row }) => {
				const { copyToClipboard } = useCopyToClipboard({
					successMessage: "ID copied to clipboard",
				});
				const scanId = row.original.scanId;

				return (
					<div className="min-w-[100px] py-2 sm:py-3">
						<div className="truncate font-medium text-xs sm:text-sm">
							{row.getValue("name") || "Unknown"}
						</div>
						{scanId && (
							<div className="mt-1 flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									className="group rounded-none p-0! hover:bg-transparent"
									onClick={() => copyToClipboard(scanId)}
								>
									<span className="font-mono text-[10px] text-muted-foreground group-hover:underline sm:text-xs">
										{scanId}
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
					<div className="hidden md:flex">
						<SortableHeader
							column={column}
							label="Event"
							className="text-xs sm:text-sm"
						/>
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
			accessorKey: "type",
			size: 100,
			header: () => (
				<div className="hidden font-medium text-xs sm:table-cell sm:text-sm">
					Type
				</div>
			),
			cell: ({ row }) => {
				const result = row.original;
				return (
					<div className="hidden min-w-[100px] py-2 sm:table-cell sm:py-3">
						<TypeBadge
							type={result.type}
							role={result.role}
							className="rounded-none"
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "timestamp",
			size: 120,
			header: ({ column }) => {
				return (
					<SortableHeader
						column={column}
						label="Check-In"
						className="whitespace-nowrap text-xs sm:text-sm"
					/>
				);
			},
			cell: ({ row }) => {
				const timestamp = row.getValue("timestamp") as Date;
				const timeStr = timestamp.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
				const dateStr = timestamp.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				});
				return (
					<div className="flex flex-col py-2 sm:py-3">
						<span className="text-xs font-medium sm:text-sm">{timeStr}</span>
						<span className="text-[10px] text-muted-foreground sm:text-xs">{dateStr}</span>
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
			filterFn: (row, _id, value) => {
				if (value === undefined || value === "all") return true;
				return row.original.status === value;
			},
			header: ({ column }) => {
				return (
					<SortableHeader
						column={column}
						label="Status"
						className="text-xs sm:text-sm"
					/>
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
}
