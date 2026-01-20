"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { EventVendor } from "@/lib/api/event-vendor";
import { cn } from "@/lib/utils";
import { EventVendorActionsMenu } from "./event-vendor-action-menu";

export type EventVendorMember = EventVendor;

// Type filter options
const TYPE_OPTIONS = [
	{ label: "Exhibitor", value: "Exhibitor" },
	{ label: "Merchant", value: "Merchant" },
];

// Helper function to format date with time and date parts
function formatDateTime(dateString: string): {
	timePart: string;
	datePart: string;
} {
	const date = new Date(dateString);
	const timePart = date.toLocaleString("en-US", { timeStyle: "medium" });
	const datePart = date.toLocaleString("en-US", { dateStyle: "medium" });
	return { timePart, datePart };
}

// Base columns that are always shown
const baseColumns: ColumnDef<EventVendorMember>[] = [
	{
		accessorKey: "vendor.full_name",
		id: "full_name",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Vendor Name" />,
		cell: ({ row }) => (
			<div className="max-w-[200px] truncate font-medium">
				{row.original.vendor.full_name}
			</div>
		),
	},
	{
		accessorKey: "vendor.email",
		id: "email",
		size: 220,
		header: ({ column }) => <SortableHeader column={column} label="Email" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.original.vendor.email}
			</div>
		),
	},
	{
		accessorKey: "type",
		size: 140,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Type"
				options={TYPE_OPTIONS}
				allOptionLabel="All Types"
			/>
		),
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge
					variant="outline"
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						type === "Exhibitor" && "border-purple-500 text-purple-500",
						type === "Merchant" && "border-blue-500 text-blue-500",
					)}
				>
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "redirect_url",
		size: 250,
		header: () => <p className="font-medium">Redirect URL</p>,
		cell: ({ row }) => (
			<div className="max-w-[250px] truncate text-muted-foreground text-sm">
				{row.getValue("redirect_url") || "-"}
			</div>
		),
	},
	{
		accessorKey: "poster_url",
		size: 250,
		header: () => <p className="font-medium">Poster URL</p>,
		cell: ({ row }) => (
			<div className="max-w-[250px] truncate text-muted-foreground text-sm">
				{row.getValue("poster_url") || "-"}
			</div>
		),
	},
	{
		accessorKey: "created_at",
		size: 130,
		header: ({ column }) => (
			<SortableHeader column={column} label="Added At" />
		),
		cell: ({ row }) => {
			const { timePart, datePart } = formatDateTime(
				row.getValue("created_at"),
			);
			return (
				<div className="flex flex-col">
					<div className="text-sm">{datePart}</div>
					<div className="text-muted-foreground text-xs">{timePart}</div>
				</div>
			);
		},
	},
];

// Actions column (only for event_admin and org_owner)
const actionsColumn: ColumnDef<EventVendorMember> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const vendor = row.original;
		return (
			<div className="flex justify-center">
				<EventVendorActionsMenu vendor={vendor} />
			</div>
		);
	},
};

// Function to get columns based on permissions
export const getEventVendorColumns = (
	canManageVendors = false,
): ColumnDef<EventVendorMember>[] => {
	// Only users who can manage vendors see actions column
	if (canManageVendors) {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export for backward compatibility (with actions column)
export const columns: ColumnDef<EventVendorMember>[] = [
	...baseColumns,
	actionsColumn,
];
