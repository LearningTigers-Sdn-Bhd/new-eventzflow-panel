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
import { CreateTopicsButton } from "@/components/pages/resources/manage/topics/page-action/create-topics-button";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { TopicsItem } from "./topics-item";
import { columns } from "./topics-table-columns";
import { TopicsTableControl } from "./topics-table-control";

type TopicFilter = "active" | "archived" | "all";

interface TopicsTableProps {
	data: ResourceTopic[];
	filter?: TopicFilter;
	onFilterChange?: (filter: TopicFilter) => void;
}

export function TopicsTable({
	data,
	filter = "active",
	onFilterChange,
}: TopicsTableProps) {
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
			<TopicsTableControl
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
								title: "No topics found",
								desc: "Get started by creating a new topic.",
								icon: <FileText className="h-10 w-10 text-muted-foreground" />,
								action: <CreateTopicsButton />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows.map((row) => (
								<TopicsItem key={row.id} topic={row.original} />
							))}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows.map((row) => (
								<TopicsItem key={row.id} topic={row.original} />
							))}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}