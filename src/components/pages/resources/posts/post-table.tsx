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
import type { Resource } from "@/lib/api/resource/response";
import { CreatePostButton } from "./page-action/create-post-button";
import { PostItem } from "./post-item";
import { columns } from "./post-table-columns";
import { PostTableControl } from "./post-table-control";

type PostFilter = "published" | "draft" | "pending_review" | "archived" | "all";

interface ClickableRowConfig<TData> {
	isEnabled: boolean;
	onRowClick?: (row: TData) => void;
	excludeRowClickColumns?: string[];
}

interface PostTableProps {
	data: Resource[];
	filter?: PostFilter;
	onFilterChange?: (filter: PostFilter) => void;
	clickableRowConfig?: ClickableRowConfig<Resource>;
	pagination?: {
		pageIndex: number;
		pageSize: number;
		totalCount: number;
	};
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

export function PostTable({
	data,
	filter = "all",
	onFilterChange,
	clickableRowConfig,
	pagination,
	onPaginationChange,
}: PostTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "status", desc: false },
		{ id: "updatedAt", desc: true },
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			topic: false,
			category: false,
			mediaType: false,
			slug: false,
			metaDescription: false,
			createdAt: false,
			updatedAt: false,
		});

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
			<PostTableControl
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
								title: "No posts found",
								desc: "Get started by creating a new post.",
								icon: <FileText className="h-10 w-10 text-muted-foreground" />,
								action: <CreatePostButton />,
							}}
							clickableRowConfig={clickableConfig}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows.map((row) => (
								<PostItem
									key={row.id}
									post={row.original}
									onClick={
										clickableRowConfig?.isEnabled
											? () => clickableRowConfig.onRowClick?.(row.original)
											: undefined
									}
								/>
							))}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows.map((row) => (
								<PostItem
									key={row.id}
									post={row.original}
									onClick={
										clickableRowConfig?.isEnabled
											? () => clickableRowConfig.onRowClick?.(row.original)
											: undefined
									}
								/>
							))}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
