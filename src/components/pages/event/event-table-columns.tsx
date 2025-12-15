"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CopyCell } from "@/components/admin-ui/table/cell/copy-cell";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import {
	EVENT_STATUS_OPTIONS,
	type EventStatus,
	getStatusBadgeColor,
} from "@/lib/constants/event-constants";
import { cn } from "@/lib/utils";
import { EventActionsMenu } from "./event-action-menu";

export type Event = {
	id: number;
	title: string;
	description: string | null;
	status: "draft" | "published" | "cancelled" | "completed";
	visibility: boolean;
	multiple_scans: boolean;
	start_date: string;
	end_date: string;
	webhook_url: string | null;
	labels_data: Record<string, unknown>;
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

// Base columns that everyone sees
const baseColumns: ColumnDef<Event>[] = [
	{
		accessorKey: "id",
		size: 140,
		header: ({ column }) => <SortableHeader column={column} label="Event ID" />,
		cell: ({ row }) => (
			<CopyCell
				value={row.getValue("id")}
				successMessage="Event ID copied to clipboard"
			/>
		),
	},
	{
		accessorKey: "title",
		size: 400,
		header: ({ column }) => <SortableHeader column={column} label="Title" />,
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("title")}</div>
		),
	},
	{
		accessorKey: "status",
		size: 160,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Status"
				options={EVENT_STATUS_OPTIONS.filter((opt) => opt.value !== "all")}
				allOptionLabel="All Status"
			/>
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as EventStatus;
			return (
				<Badge
					className={cn(
						"w-full min-w-16 max-w-24 rounded-none font-bold capitalize",
						getStatusBadgeColor(status),
					)}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "created_at",
		size: 140,
		header: ({ column }) => (
			<SortableHeader column={column} label="Created At" />
		),
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			return <div>{formatDate(row.getValue("created_at"))}</div>;
		},
	},
	{
		id: "actions",
		size: 160,
		enableHiding: false,
		header: "Actions",
		cell: ({ row }) => {
			const event = row.original;
			return (
				<EventActionsMenu eventId={event.id} deletedAt={event.deleted_at} />
			);
		},
	},
];

// Visibility column - only for org_owner
const visibilityColumn: ColumnDef<Event> = {
	accessorKey: "visibility",
	size: 120,
	header: ({ column }) => (
		<FilterableHeader
			column={column}
			label="Visibility"
			options={[
				{ label: "YES", value: true },
				{ label: "NO", value: false },
			]}
			allOptionLabel="All"
			triggerType="button"
			buttonVariant="ghost"
			buttonSize="sm"
			className="-ml-3 h-8"
			highlightActive
		/>
	),
	cell: ({ row }) => {
		const visibility = row.getValue("visibility") as boolean;
		return (
			<Badge
				className={cn(
					"w-full max-w-12 rounded-none font-semibold",
					visibility
						? "bg-green-500 hover:bg-green-600"
						: "bg-gray-500 hover:bg-gray-600",
				)}
			>
				{visibility ? "YES" : "NO"}
			</Badge>
		);
	},
	filterFn: (row, id, value) => {
		if (value === undefined) return true;
		return row.getValue(id) === value;
	},
};

// Function to get columns based on user role
export const getColumns = (userRole?: string): ColumnDef<Event>[] => {
	if (userRole === "org_owner") {
		// Insert visibility column after status column (index 3)
		const columnsWithVisibility = [...baseColumns];
		columnsWithVisibility.splice(3, 0, visibilityColumn);
		return columnsWithVisibility;
	}
	return baseColumns;
};

// Default export for backward compatibility
export const columns = baseColumns;
