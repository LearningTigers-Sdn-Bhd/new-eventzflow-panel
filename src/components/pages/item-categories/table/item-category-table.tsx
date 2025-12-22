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
import { FolderOpen } from "lucide-react";
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
import type { ItemCategory } from "@/lib/api/item-category";
import { ItemCategoryItem } from "./item-category-item";
import type { BaseItemCategory } from "./item-category-table-columns";
import { generateColumns } from "./item-category-table-columns";
import { DataControl } from "./item-category-table-control";

interface DataTableProps {
	data: ItemCategory[];
	onAddCategory?: () => void;
}

export function ItemCategoryTable({ data, onAddCategory }: DataTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	// Initialize with default visibility
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(
		() => generateColumns() as ColumnDef<BaseItemCategory>[],
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
			<DataControl table={table} />

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No categories found",
								desc: "Add your first item category to get started",
								icon: <FolderOpen />,
								action: onAddCategory ? (
									<Button onClick={onAddCategory}>Add Category</Button>
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
										<ItemCategoryItem
											key={row.id}
											category={row.original as ItemCategory}
										/>
									))
							) : (
								<EmptyState
									title="No categories found"
									description="Add your first item category to get started"
									icon={<FolderOpen />}
									height="h-auto"
									action={
										onAddCategory ? (
											<Button onClick={onAddCategory}>Add Category</Button>
										) : undefined
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
										<ItemCategoryItem category={row.original as ItemCategory} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No categories found"
										description="Add your first item category to get started"
										icon={<FolderOpen />}
										height="h-auto"
										action={
											onAddCategory ? (
												<Button onClick={onAddCategory}>Add Category</Button>
											) : undefined
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
