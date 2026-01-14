"use client";

import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { FileText } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { CreateCategoriesButton } from "@/components/pages/resources/manage/categories/page-action/create-categories-button";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import { CategoriesItem } from "./categories-item";
import { columns } from "./categories-table-columns";
import { CategoriesTableControl } from "./categories-table-control";

type CategoryFilter = "active" | "archived" | "all";

interface CategoriesTableProps {
	data: ResourceCategory[];
	filter?: CategoryFilter;
	onFilterChange?: (filter: CategoryFilter) => void;
}

export function CategoriesTable({
	data,
	filter = "active",
	onFilterChange,
}: CategoriesTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="w-full">
			<CategoriesTableControl
				table={table}
				filter={filter}
				onFilterChange={onFilterChange}
			/>
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No categories found",
								desc: "Get started by creating a new category.",
								icon: <FileText className="h-10 w-10 text-muted-foreground" />,
								action: <CreateCategoriesButton />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows.map((row) => (
								<CategoriesItem key={row.id} category={row.original} />
							))}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows.map((row) => (
								<CategoriesItem key={row.id} category={row.original} />
							))}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
