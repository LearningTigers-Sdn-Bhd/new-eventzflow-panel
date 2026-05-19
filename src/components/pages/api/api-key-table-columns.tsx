"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { ApiKeyScope } from "@/lib/api/api-keys";
import { cn } from "@/lib/utils";
import { ApiKeyActionsMenu } from "./api-key-action-menu";

export type BaseApiKey = {
	id: string;
	name: string;
	scope: ApiKeyScope;
	isActive: boolean;
	lastUsedAt: string | null;
	createdAt: string;
	eventId?: number | null;
};

const SCOPE_LABELS: Record<ApiKeyScope, string> = {
	read_only: "Read only",
	check_in: "Check-in",
	read_write: "Full access",
};

const SCOPE_BADGE_CLASS: Record<ApiKeyScope, string> = {
	read_only: "bg-slate-500 text-white",
	check_in: "bg-blue-500 text-white",
	read_write: "bg-amber-500 text-white",
};

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: true },
	{ label: "Revoked", value: false },
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

// Format date only
function formatDate(dateString: string | null): string {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Invalid Date";
	return date.toLocaleDateString();
}

export function generateApiKeysColumns(): ColumnDef<BaseApiKey>[] {
	const baseColumns: ColumnDef<BaseApiKey>[] = [
		{
			accessorKey: "name",
			size: 200,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => {
				const name = String(row.getValue("name") || "");
				return <div className="font-medium">{name}</div>;
			},
		},
		{
			accessorKey: "isActive",
			size: 120,
			filterFn: (row, id, value) => {
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
				const isActive = row.getValue("isActive") as boolean;
				return (
					<Badge
						variant={isActive ? "default" : "secondary"}
						className={cn(
							"min-w-16 rounded-none font-bold capitalize",
							isActive && "bg-green-500 text-white",
							!isActive && "bg-red-500 text-white",
						)}
					>
						{isActive ? "Active" : "Revoked"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "scope",
			size: 130,
			header: ({ column }) => (
				<SortableHeader column={column} label="Permission" />
			),
			cell: ({ row }) => {
				const scope = (row.getValue("scope") as ApiKeyScope) ?? "read_only";
				return (
					<Badge
						className={cn(
							"min-w-20 rounded-none font-bold capitalize",
							SCOPE_BADGE_CLASS[scope],
						)}
					>
						{SCOPE_LABELS[scope]}
					</Badge>
				);
			},
		},
		{
			accessorKey: "lastUsedAt",
			size: 180,
			header: ({ column }) => (
				<SortableHeader column={column} label="Last Used" />
			),
			cell: ({ row }) => {
				const lastUsedAt = row.getValue("lastUsedAt") as string | null;

				if (!lastUsedAt) {
					return (
						<Badge
							variant="outline"
							className="rounded-none text-muted-foreground"
						>
							Never Used
						</Badge>
					);
				}

				return <div className="text-sm">{formatDate(lastUsedAt)}</div>;
			},
		},
		{
			accessorKey: "createdAt",
			size: 200,
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
			size: 80,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const apiKey = row.original;
				return (
					<div className="flex justify-center">
						<ApiKeyActionsMenu apiKey={apiKey} />
					</div>
				);
			},
		},
	];

	return baseColumns;
}
