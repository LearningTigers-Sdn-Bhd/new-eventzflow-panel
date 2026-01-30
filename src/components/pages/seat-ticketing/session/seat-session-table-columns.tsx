"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CopyCell } from "@/components/admin-ui/table/cell/copy-cell";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";
import { SeatSessionActionMenu } from "./seat-session-action-menu";
import { getSessionStatusConfig } from "./utils";

export type SeatSessionRow = {
	id: string;
	name: string;
	status: string;
	location?: string | null;
	start_datetime?: string | null;
	end_datetime?: string | null;
	deleted_at?: string | null;
	archived?: boolean;
};

export const columns: ColumnDef<SeatSessionRow>[] = [
	{
		accessorKey: "id",
		size: 140,
		header: ({ column }) => (
			<SortableHeader column={column} label="Session ID" />
		),
		cell: ({ row }) => (
			<CopyCell
				value={row.getValue("id")}
				successMessage="Session ID copied to clipboard"
			/>
		),
	},
	{
		accessorKey: "name",
		size: 260,
		header: ({ column }) => (
			<SortableHeader column={column} label="Session" />
		),
		cell: ({ row }) => (
			<div className="truncate font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "location",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="Location" />
		),
		cell: ({ row }) => {
			const location = row.getValue("location") as string | null | undefined;
			return (
				<div
					className={cn(
						"truncate font-medium",
						!location && "text-muted-foreground italic",
					)}
				>
					{location || "Not set"}
				</div>
			);
		},
	},
	{
		accessorKey: "start_datetime",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="Start" />
		),
		cell: ({ row }) => (
			<div className="font-medium">
				{formatDateTime(row.getValue("start_datetime"))}
			</div>
		),
	},
	{
		accessorKey: "end_datetime",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="End" />
		),
		cell: ({ row }) => (
			<div className="font-medium">
				{formatDateTime(row.getValue("end_datetime"))}
			</div>
		),
	},
	{
		id: "status",
		size: 160,
		header: ({ column }) => (
			<SortableHeader column={column} label="Status" />
		),
		accessorFn: (row) => row.status,
		cell: ({ row }) => {
			const statusConfig = getSessionStatusConfig(row.original.status);
			const isArchived = row.original.archived ?? !!row.original.deleted_at;
			return (
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className={cn("rounded-none", statusConfig.className)}
					>
						{statusConfig.label}
					</Badge>
					{isArchived && (
						<Badge
							variant="outline"
							className="rounded-none border-amber-500 bg-amber-50 text-amber-700"
						>
							Archived
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 120,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<SeatSessionActionMenu session={row.original} />
			</div>
		),
	},
];
