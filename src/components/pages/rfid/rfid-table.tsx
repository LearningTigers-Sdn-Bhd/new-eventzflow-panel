"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import { Radio } from "lucide-react";
import type * as React from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type {
	ControlConfig,
	SearchConfig,
} from "@/components/admin-ui/table/control/type";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RfidServerPagination = {
	pageIndex: number;
	pageSize: number;
	pageCount: number;
	totalCount: number;
	onPageChange: (pageIndex: number) => void;
	// Shows the "Rows per page" selector in the footer when given.
	onPageSizeChange?: (size: number) => void;
};

// Same search + filter bar as the Manage Tickets table. Search and filters
// are server-side here, so `search.controlled` must be set.
export type RfidTableControl = {
	search: SearchConfig;
	filters: ControlConfig[];
};

// Table instance for a server-paginated page of rows (sorting is off: the
// server orders). Shared by RfidTable and the expandable Visits table so both
// get the same toolbar and footer.
export function useRfidTable<TData>(
	columns: ColumnDef<TData, unknown>[],
	data: TData[],
	pagination?: RfidServerPagination,
) {
	return useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: pagination?.pageCount ?? -1,
		onPaginationChange: (updater) => {
			if (!pagination) return;
			const state = {
				pageIndex: pagination.pageIndex,
				pageSize: pagination.pageSize,
			};
			const next = typeof updater === "function" ? updater(state) : updater;
			pagination.onPageChange(next.pageIndex);
		},
		state: {
			pagination: {
				pageIndex: pagination?.pageIndex ?? 0,
				pageSize: pagination?.pageSize ?? data.length,
			},
		},
	});
}

export function RfidControlBar<TData>({
	table,
	control,
}: {
	table: Table<TData>;
	control: RfidTableControl;
}) {
	return (
		<BaseTableControl
			table={table}
			searchConfig={{ searchConfig: control.search }}
			desktopConfig={{ controlConfigs: control.filters }}
			mobileConfig={{
				controlConfigs: control.filters.map((filter) => ({
					...filter,
					topPriority: true,
				})),
			}}
		/>
	);
}

export function RfidPager<TData>({
	table,
	pagination,
}: {
	table: Table<TData>;
	pagination: RfidServerPagination;
}) {
	return (
		<DataPagination
			table={table}
			totalRows={pagination.totalCount}
			pageSize={pagination.onPageSizeChange ? pagination.pageSize : undefined}
			onPageSizeChange={pagination.onPageSizeChange}
		/>
	);
}

/**
 * Small server-paginated table shared by the RFID tabs. Mirrors the manual
 * pagination pattern used by Scanned Logs / Activity Log: `data` is exactly
 * one page from the backend (pagy), sorting stays off because ordering is
 * server-defined. Desktop shows the full table; mobile/tablet shows cards.
 */
export function RfidTable<TData>({
	columns,
	data,
	emptyTitle,
	emptyDescription,
	pagination,
	control,
	renderMobileCard,
}: {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	emptyTitle: string;
	emptyDescription: string;
	pagination?: RfidServerPagination;
	control?: RfidTableControl;
	renderMobileCard: (row: TData) => React.ReactNode;
}) {
	const table = useRfidTable(columns, data, pagination);

	const rows = table.getRowModel().rows;

	return (
		<div className="w-full">
			{control && <RfidControlBar table={table} control={control} />}
			<ResponsiveLayout>
				<DesktopView>
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: emptyTitle,
							desc: emptyDescription,
							icon: <Radio />,
						}}
					/>
				</DesktopView>
				<MobileTabletView>
					{rows.length > 0 ? (
						<div className="flex flex-col gap-2 border-t pt-2">
							{rows.map((row) => (
								<div key={row.id}>{renderMobileCard(row.original)}</div>
							))}
						</div>
					) : (
						<EmptyState
							title={emptyTitle}
							description={emptyDescription}
							icon={<Radio />}
							height="h-auto"
						/>
					)}
				</MobileTabletView>
			</ResponsiveLayout>

			{pagination && <RfidPager table={table} pagination={pagination} />}
		</div>
	);
}

const OUTCOME_BADGE_CLASSES: Record<string, string> = {
	accepted: "bg-green-100 text-green-800 hover:bg-green-100",
	unknown_tag: "bg-amber-100 text-amber-800 hover:bg-amber-100",
	revoked_tag: "bg-red-100 text-red-800 hover:bg-red-100",
	wrong_event: "bg-red-100 text-red-800 hover:bg-red-100",
	ticket_invalid: "bg-red-100 text-red-800 hover:bg-red-100",
	not_checked_in: "bg-orange-100 text-orange-800 hover:bg-orange-100",
	possible_duplicate: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

export function OutcomeBadge({ outcome }: { outcome: string | null }) {
	if (!outcome) return <span className="text-muted-foreground">—</span>;
	return (
		<Badge
			className={cn(
				"rounded-none",
				OUTCOME_BADGE_CLASSES[outcome] ??
					"bg-gray-100 text-gray-800 hover:bg-gray-100",
			)}
		>
			{outcome.replaceAll("_", " ")}
		</Badge>
	);
}

export function formatDuration(
	seconds: number | null,
	withSeconds = false,
): string {
	if (seconds == null) return "—";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	if (h > 0) return withSeconds ? `${h}h ${m}m ${seconds % 60}s` : `${h}h ${m}m`;
	return `${m}m ${seconds % 60}s`;
}
