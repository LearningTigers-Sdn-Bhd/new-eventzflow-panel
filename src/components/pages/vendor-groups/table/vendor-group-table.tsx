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
import { Users } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/api/group/response";
import { GroupItem } from "./group-item";
import { generateColumns } from "./vendor-group-table-columns";
import { DataControl } from "./vendor-group-table-control";

interface DataTableProps<TData> {
	data: TData[];
	onAddGroup?: () => void;
}

export function DataTable<TData>({ data, onAddGroup }: DataTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(
		() => generateColumns() as ColumnDef<TData>[],
		[],
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
			{/* Control Panel */}
			<DataControl table={table} />

			<div className="min-h-[65vh]">
				{/* Data Table */}
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No groups found",
								desc: "Add your first group to get started",
								icon: <Users />,
								action: onAddGroup && (
									<Button onClick={onAddGroup}>Create Group</Button>
								),
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<GroupItem key={row.id} group={row.original as Group} />
									))
							) : (
								<EmptyState
									title="No groups found"
									description="Add your first group to get started"
									icon={<Users />}
									height="h-auto"
									action={
										onAddGroup && (
											<Button onClick={onAddGroup}>Create Group</Button>
										)
									}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<GroupItem group={row.original as Group} />
									</div>
								))
							) : (
								<EmptyState
									title="No groups found"
									description="Add your first group to get started"
									icon={<Users />}
									height="h-auto"
									action={
										onAddGroup && (
											<Button onClick={onAddGroup}>Create Group</Button>
										)
									}
								/>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}
