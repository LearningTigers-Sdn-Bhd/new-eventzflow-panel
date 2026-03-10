"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TicketActionsMenu } from "./event-ticket-action-menu";

export type BaseTicket = {
	id: string;
	publicId: string;
	role?: string | null;
	name: string;
	email: string | null;
	registeredByEmail?: string;
	phone: string;
	value: number | string;
	status: "scanned" | "not_scanned";
	customLabels?: Array<{ name: string; value: string }>;
	createdAt: string;
	ticketTypeId?: number;
	ticketTypeName?: string;
	checkedIn?: boolean;
	checkInAt?: string | null;
	deletedAt?: string | null;
};

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Scanned", value: "scanned" },
	{ label: "Not Scanned", value: "not_scanned" },
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

export function generateColumns(
	labelsData?: Record<string, string>,
): ColumnDef<BaseTicket>[] {
	// Base columns that everyone sees
	// Order: Name, Phone (hidden), Email, Ticket Type, Status, Created At, Actions
	const baseColumns: ColumnDef<BaseTicket>[] = [
		{
			accessorKey: "name",
			size: 200,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<div className="truncate font-medium">{row.getValue("name")}</div>
					<div className="truncate text-muted-foreground text-sm">
						{row.original.phone || "No phone"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "phone",
			enableHiding: false,
			enableSorting: false,
			// Hidden column used for search functionality
		},
		{
			accessorKey: "email",
			size: 220,
			header: ({ column }) => <SortableHeader column={column} label="Email" />,
			cell: ({ row }) => {
				const email = row.getValue("email") as string | null;
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
			accessorKey: "role",
			size: 150,
			header: ({ column }) => <SortableHeader column={column} label="Role" />,
			cell: ({ row }) => {
				const role = row.getValue("role") as string | undefined;
				if (!role) return <span className="text-muted-foreground">-</span>;
				return (
					<Badge
						variant="outline"
						className="rounded-none border-primary/20 bg-primary/5 text-primary"
					>
						{role}
					</Badge>
				);
			},
		},
		{
			accessorKey: "ticketTypeName",
			size: 140,
			header: "Ticket Type",
			cell: ({ row }) => (
				<div className="truncate font-medium">
					{row.getValue("ticketTypeName") || "N/A"}
				</div>
			),
			// Note: Ticket types are dynamic, so FilterableHeader cannot be used here
			// Filtering is handled via filterFn for compatibility with existing filter logic
			filterFn: (row, id, value) => {
				if (value === undefined) return true;
				if (Array.isArray(value)) {
					return value.includes(row.getValue(id));
				}
				return row.getValue(id) === value;
			},
		},
		{
			accessorKey: "status",
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
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={status === "scanned" ? "default" : "secondary"}
						className={cn(
							status === "scanned"
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
							"rounded-none",
						)}
					>
						{status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			size: 140,
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
			size: 120,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const ticket = row.original;
				return (
					<div className="flex justify-center">
						<TicketActionsMenu ticket={ticket} deletedAt={ticket.deletedAt} />
					</div>
				);
			},
		},
	];

	// Generate dynamic columns for custom fields based on labelsData
	// These columns will be inserted before the "Created At" column
	const customColumns: ColumnDef<BaseTicket>[] = [];
	if (labelsData && Object.keys(labelsData).length > 0) {
		Object.entries(labelsData).forEach(([key, labelName]) => {
			customColumns.push({
				id: `custom_${key}`,
				accessorFn: (row) => {
					// Match by key, not display name
					const customLabel = row.customLabels?.find((l) => l.name === key);
					return customLabel?.value || "";
				},
				size: 180,
				header: ({ column }) => (
					<SortableHeader column={column} label={labelName} />
				),
				cell: ({ row }) => {
					// Match by key, not display name
					const customLabel = row.original.customLabels?.find(
						(l) => l.name === key,
					);
					const value = customLabel?.value || "";
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
	// Final order: Name, Phone (hidden), Email, Ticket Type, Status, [Custom Labels], Created At, Actions
	const createdAtIndex = baseColumns.findIndex(
		(col) => "accessorKey" in col && col.accessorKey === "createdAt",
	);

	return [
		...baseColumns.slice(0, createdAtIndex),
		...customColumns,
		...baseColumns.slice(createdAtIndex),
	];
}
