"use client";

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
import { Mail } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import type { ResourceLead } from "@/lib/api/resource/lead/response";
import { LeadsItem } from "./leads-item";
import { columns } from "./leads-table-columns";
import { LeadsTableControl } from "./leads-table-control";

interface ClickableRowConfig<TData> {
	isEnabled: boolean;
	onRowClick?: (row: TData) => void;
	excludeRowClickColumns?: string[];
}

interface LeadsTableProps {
	data: ResourceLead[];
	clickableRowConfig?: ClickableRowConfig<ResourceLead>;
	pagination?: {
		pageIndex: number;
		pageSize: number;
		totalCount: number;
	};
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

export function LeadsTable({
	data,
	clickableRowConfig,
	pagination,
	onPaginationChange,
}: LeadsTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		pageCount: pagination
			? Math.ceil(pagination.totalCount / pagination.pageSize)
			: undefined,
		manualPagination: !!pagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: (updater) => {
			if (pagination && onPaginationChange) {
				const nextState =
					typeof updater === "function"
						? updater({
								pageIndex: pagination.pageIndex,
								pageSize: pagination.pageSize,
							})
						: updater;
				onPaginationChange(nextState.pageIndex, nextState.pageSize);
			}
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			...(pagination && {
				pagination: {
					pageIndex: pagination.pageIndex,
					pageSize: pagination.pageSize,
				},
			}),
		},
	});

	const clickableConfig = React.useMemo(() => {
		if (!clickableRowConfig) return undefined;

		return {
			...clickableRowConfig,
			excludeRowClickColumns: [
				...(clickableRowConfig.excludeRowClickColumns || []),
				"actions",
			],
		};
	}, [clickableRowConfig]);

	return (
		<div className="w-full">
			<LeadsTableControl table={table} />
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No leads found",
								desc: "No leads have been submitted yet for gated resources.",
								icon: <Mail className="h-10 w-10 text-muted-foreground" />,
							}}
							clickableRowConfig={clickableConfig}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows.length > 0 ? (
								table.getRowModel().rows.map((row) => (
									<LeadsItem
										key={row.id}
										lead={row.original}
										onClick={
											clickableRowConfig?.isEnabled
												? () => clickableRowConfig.onRowClick?.(row.original)
												: undefined
										}
									/>
								))
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Mail className="mb-4 h-10 w-10 text-muted-foreground" />
									<h3 className="mb-1 font-semibold text-lg">No leads found</h3>
									<p className="text-muted-foreground text-sm">
										No leads have been submitted yet for gated resources.
									</p>
								</div>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows.length > 0 ? (
								table.getRowModel().rows.map((row) => (
									<LeadsItem
										key={row.id}
										lead={row.original}
										onClick={
											clickableRowConfig?.isEnabled
												? () => clickableRowConfig.onRowClick?.(row.original)
												: undefined
										}
									/>
								))
							) : (
								<div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
									<Mail className="mb-4 h-10 w-10 text-muted-foreground" />
									<h3 className="mb-1 font-semibold text-lg">No leads found</h3>
									<p className="text-muted-foreground text-sm">
										No leads have been submitted yet for gated resources.
									</p>
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
