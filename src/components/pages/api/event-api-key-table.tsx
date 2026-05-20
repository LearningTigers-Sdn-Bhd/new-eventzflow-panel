"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Key } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import type { ApiKey, ApiKeyScope } from "@/lib/api/api-keys";
import { cn } from "@/lib/utils";
import { ApiKeyItem } from "./api-key-item";
import { ApiKeyTableControl } from "./api-key-table-control";
import { EventApiKeyActionsMenu } from "./event-api-key-action-menu";

interface EventApiKeyTableProps {
	eventId: number;
	data: ApiKey[];
}

const STATUS_OPTIONS = [
	{ label: "Active", value: true },
	{ label: "Revoked", value: false },
];

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

function formatDateTime(dateString: string): {
	timePart: string;
	datePart: string;
} {
	const date = new Date(dateString);
	return {
		timePart: date.toLocaleString("en-US", { timeStyle: "medium" }),
		datePart: date.toLocaleString("en-US", { dateStyle: "medium" }),
	};
}

function formatDate(dateString: string | null): string {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Invalid Date";
	return date.toLocaleDateString();
}

export function EventApiKeyTable({ eventId, data }: EventApiKeyTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo<ColumnDef<ApiKey>[]>(
		() => [
			{
				accessorKey: "name",
				size: 200,
				header: ({ column }) => <SortableHeader column={column} label="Name" />,
				cell: ({ row }) => (
					<div className="font-medium">{row.getValue("name")}</div>
				),
			},
			{
				accessorKey: "isActive",
				size: 120,
				filterFn: (row, id, value) => row.getValue(id) === value,
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
					if (!lastUsedAt)
						return (
							<Badge
								variant="outline"
								className="rounded-none text-muted-foreground"
							>
								Never Used
							</Badge>
						);
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
				meta: { sticky: "right" },
				header: () => <div className="text-center">Actions</div>,
				cell: ({ row }) => (
					<div className="flex justify-center">
						<EventApiKeyActionsMenu eventId={eventId} apiKey={row.original} />
					</div>
				),
			},
		],
		[eventId],
	);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: { sorting, columnFilters, columnVisibility },
	});

	return (
		<div className="w-full">
			<ApiKeyTableControl table={table} />
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No API keys found",
								desc: "Generate your first API key to get started",
								icon: <Key />,
								action: null,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<ApiKeyItem key={row.id} apiKey={row.original as any} />
									))
							) : (
								<EmptyState
									title="No API keys found"
									description="Generate your first API key to get started"
									icon={<Key />}
									height="h-auto"
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<ApiKeyItem apiKey={row.original as any} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No API keys found"
										description="Generate your first API key to get started"
										icon={<Key />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
