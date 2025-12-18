"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { ItemCategory } from "@/lib/api/item-category";
import { cn } from "@/lib/utils";
import { CategoryActionsMenu } from "./action-menu";

export type BaseItemCategory = {
	id: number;
	name: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
};

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: true },
	{ label: "Inactive", value: false },
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

export function generateColumns(): ColumnDef<BaseItemCategory>[] {
	// Base columns for item categories
	// Order: Name, Status, Created At, Actions
	const baseColumns: ColumnDef<BaseItemCategory>[] = [
		{
			accessorKey: "name",
			size: 250,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<div className="truncate font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "active",
			size: 120,
			filterFn: (row, id, value) => {
				if (value === undefined) return true;
				return row.getValue(id) === value;
			},
			header: ({ column }) => (
				<FilterableHeader
					column={column}
					label="Status"
					options={STATUS_OPTIONS}
					allOptionLabel="All Status"
				/>
			),
			cell: ({ row }) => {
				const active = row.getValue("active") as boolean;
				return (
					<Badge
						variant={active ? "default" : "secondary"}
						className={cn(
							"rounded-none capitalize",
							active
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						)}
					>
						{active ? "Active" : "Inactive"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			size: 180,
			header: ({ column }) => (
				<SortableHeader column={column} label="Created At" />
			),
			cell: ({ row }) => {
				const { timePart, datePart } = formatDateTime(
					row.getValue("createdAt"),
				);
				return (
					<div className="font-medium">
						<div className="font-semibold">{timePart}</div>
						<div className="text-gray-500 text-sm">{datePart}</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			size: 100,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const category = row.original as ItemCategory;
				return (
					<div className="flex justify-center">
						<CategoryActionsMenu category={category} />
					</div>
				);
			},
		},
	];

	return baseColumns;
}

// Legacy export for backward compatibility
export const columns = generateColumns();
