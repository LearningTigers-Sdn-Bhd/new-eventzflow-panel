"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import { VisitorActionsMenu } from "./event-visitor-action-menu";

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

export function generateColumns(
	labelsData?: Record<string, string>,
): ColumnDef<Visitor>[] {
	// Base columns that everyone sees
	// Order: Name, Phone (hidden), Email, [Custom Labels], Created At, Actions
	const baseColumns: ColumnDef<Visitor>[] = [
		{
			accessorKey: "full_name",
			size: 200,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<div className="truncate font-medium">
						{row.getValue("full_name")}
					</div>
					<div className="truncate text-muted-foreground text-sm">
						{row.original.phone || "No phone"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "phone",
			enableHiding: true,
			enableSorting: false,
			meta: {
				hidden: true,
			},
			header: () => null,
			cell: () => null,
		},
		{
			accessorKey: "email",
			size: 250,
			header: ({ column }) => <SortableHeader column={column} label="Email" />,
			cell: ({ row }) => {
				const email = row.getValue("email") as string | undefined;
				return (
					<div
						className={cn(
							"font-medium",
							!email && "text-muted-foreground italic",
						)}
					>
						{email || "Not provided"}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			size: 180,
			header: ({ column }) => (
				<SortableHeader column={column} label="Created At" />
			),
			cell: ({ row }) => {
				const { timePart, datePart } = formatDateTime(
					row.getValue("created_at"),
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
			enableSorting: false,
			enableHiding: false,
			size: 120,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const visitor = row.original;
				return (
					<div className="flex justify-center">
						<VisitorActionsMenu visitor={visitor} />
					</div>
				);
			},
		},
	];

	// Generate dynamic columns for custom fields based on labelsData
	// These columns will be inserted before the "Created At" column
	const customColumns: ColumnDef<Visitor>[] = [];
	if (labelsData && Object.keys(labelsData).length > 0) {
		Object.entries(labelsData).forEach(([key, labelName]) => {
			customColumns.push({
				id: `custom_${key}`,
				accessorFn: (row) => {
					return row.custom_fields_data?.[key] || "";
				},
				size: 180,
				header: ({ column }) => (
					<SortableHeader column={column} label={labelName} />
				),
				cell: ({ row }) => {
					const rawValue = row.original.custom_fields_data?.[key];
					const value = typeof rawValue === "string" ? rawValue : "";
					return (
						<div
							className={cn(
								"truncate font-medium",
								!value && "text-muted-foreground italic",
							)}
						>
							{value || "Not provided"}
						</div>
					);
				},
				enableSorting: true,
				enableHiding: true,
			});
		});
	}

	// Assemble final columns: insert custom columns before "Created At"
	// Final order: Name, Phone (hidden), Email, [Custom Labels], Created At, Actions
	const createdAtIndex = baseColumns.findIndex(
		(col) => "accessorKey" in col && col.accessorKey === "created_at",
	);

	return [
		...baseColumns.slice(0, createdAtIndex),
		...customColumns,
		...baseColumns.slice(createdAtIndex),
	];
}
