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
import { CreateMediaTypeButton } from "@/components/pages/resources/manage/media-type/page-action/create-media-type-button";
import type { ResourceMediaType } from "@/lib/api/resource/media-type/response";
import { MediaTypeItem } from "./media-type-item";
import { columns } from "./media-type-table-columns";
import { MediaTypeTableControl } from "./media-type-table-control";

type MediaTypeFilter = "active" | "archived" | "all";

interface MediaTypeTableProps {
	data: ResourceMediaType[];
	filter?: MediaTypeFilter;
	onFilterChange?: (filter: MediaTypeFilter) => void;
}

export function MediaTypeTable({
	data,
	filter = "active",
	onFilterChange,
}: MediaTypeTableProps) {
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
			<MediaTypeTableControl
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
								title: "No media types found",
								desc: "Get started by creating a new media type.",
								icon: <FileText className="h-10 w-10 text-muted-foreground" />,
								action: <CreateMediaTypeButton />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows.map((row) => (
								<MediaTypeItem key={row.id} mediaType={row.original} />
							))}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows.map((row) => (
								<MediaTypeItem key={row.id} mediaType={row.original} />
							))}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
