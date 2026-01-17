"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { DrawSessionTableControl } from "./draw-session-table-control";

interface EmptyStateConfig {
	title: string;
	description: string;
	icon: React.ReactNode;
}

interface DrawSessionTableProps<TData> {
	data: TData[];
	generateColumns: () => ColumnDef<TData>[];
	emptyStateConfig: EmptyStateConfig;
	SessionItemComponent: React.ComponentType<{ session: TData }>;
	searchPlaceholder?: string;
}

/**
 * Generic table component for draw sessions
 * Used by both roulette and lucky-draw tables
 */
export function DrawSessionTable<TData>({
	data,
	generateColumns,
	emptyStateConfig,
	SessionItemComponent,
	searchPlaceholder,
}: DrawSessionTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo<ColumnDef<TData>[]>(
		() => generateColumns(),
		[generateColumns],
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
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div className="w-full">
			<DrawSessionTableControl
				table={table}
				searchPlaceholder={searchPlaceholder}
			/>

			<div className="min-h-[45vh]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: emptyStateConfig.title,
								desc: emptyStateConfig.description,
								icon: emptyStateConfig.icon,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<SessionItemComponent key={row.id} session={row.original} />
									))
							) : (
								<EmptyState
									title={emptyStateConfig.title}
									description={emptyStateConfig.description}
									icon={emptyStateConfig.icon}
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
										<SessionItemComponent session={row.original} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title={emptyStateConfig.title}
										description={emptyStateConfig.description}
										icon={emptyStateConfig.icon}
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
