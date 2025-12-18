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
import { HardHat } from "lucide-react";
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
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { ContractorItem } from "./contractor-item";
import { DataControl } from "./exhibitor-contractor-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onAddContractor?: () => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onAddContractor,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

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
			<DataControl table={table} />

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No contractors found",
								desc: "Add your first contractor to get started",
								icon: <HardHat />,
								action: onAddContractor ? (
									<Button onClick={onAddContractor}>Add Contractor</Button>
								) : undefined,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<ContractorItem
											key={row.id}
											contractor={row.original as ExhibitionContractor}
										/>
									))
							) : (
								<EmptyState
									title="No contractors found"
									description="Add your first contractor to get started"
									icon={<HardHat />}
									height="h-auto"
									action={
										onAddContractor && (
											<Button onClick={onAddContractor}>Add Contractor</Button>
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
										<ContractorItem
											contractor={row.original as ExhibitionContractor}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No contractors found"
										description="Add your first contractor to get started"
										icon={<HardHat />}
										height="h-auto"
										action={
											onAddContractor && (
												<Button onClick={onAddContractor}>
													Add Contractor
												</Button>
											)
										}
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
