"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ScanLine } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScanItem } from "./scan-item";
import { DataControl } from "./scan-table-control";
import type { ScanResult } from "./types";

interface DataTableProps {
	columns: ColumnDef<ScanResult>[];
	data: ScanResult[];
	recentScan: ScanResult | null;
	filterType: string;
	sortType: "newest" | "oldest" | "status";
	isLoading?: boolean;
	onFilterChange: (filter: string) => void;
	onSortChange: (sort: "newest" | "oldest" | "status") => void;
}

function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell className="w-12 py-2 text-center sm:py-3">
				<Skeleton className="mx-auto h-4 w-6" />
			</TableCell>
			<TableCell className="min-w-[100px] py-2 sm:py-3">
				<Skeleton className="h-4 w-24" />
			</TableCell>
			<TableCell className="hidden min-w-[120px] py-2 sm:py-3 md:table-cell">
				<Skeleton className="h-4 w-32" />
			</TableCell>
			<TableCell className="hidden min-w-[100px] py-2 sm:table-cell sm:py-3">
				<Skeleton className="h-4 w-20" />
			</TableCell>
			<TableCell className="hidden min-w-[180px] py-2 sm:py-3 lg:table-cell">
				<Skeleton className="h-4 w-40" />
			</TableCell>
			<TableCell className="whitespace-nowrap py-2 sm:py-3">
				<Skeleton className="h-4 w-16" />
			</TableCell>
			<TableCell className="min-w-[150px] py-2 sm:py-3">
				<Skeleton className="h-6 w-32 rounded-full" />
			</TableCell>
		</TableRow>
	);
}

function ScanItemSkeleton() {
	return (
		<div className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
			<div className="flex justify-between">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-16" />
			</div>
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-4 w-full" />
		</div>
	);
}

export function DataTable({
	columns,
	data,
	recentScan,
	filterType,
	sortType,
	isLoading = false,
	onFilterChange,
	onSortChange,
}: DataTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([
		{
			id: "timestamp",
			desc: true, // Newest first by default
		},
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	// Create stable skeleton rows array
	const skeletonRows = React.useMemo(
		() => Array.from({ length: 5 }, (_, i) => ({ id: `skeleton-row-${i}` })),
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
		state: {
			sorting,
			columnFilters,
		},
	});

	// Sync external sort type with internal sorting state
	React.useEffect(() => {
		if (sortType === "newest") {
			setSorting([{ id: "timestamp", desc: true }]);
		} else if (sortType === "oldest") {
			setSorting([{ id: "timestamp", desc: false }]);
		} else if (sortType === "status") {
			setSorting([{ id: "status", desc: false }]);
		}
	}, [sortType]);

	// Sync external filter with internal filter state
	React.useEffect(() => {
		const eventColumn = table.getColumn("eventName");
		if (filterType === "all") {
			eventColumn?.setFilterValue(undefined);
		} else {
			// Filter by event ID (uses filterFn in column definition)
			eventColumn?.setFilterValue(filterType);
		}
	}, [filterType, table]);

	const filteredRows = table.getRowModel().rows;

	return (
		<Card className="w-full rounded-none border-primary/20 border-x-0 border-y-0 border-dashed p-0 shadow-none">
			{/* Control Panel */}
			<DataControl
				table={table}
				scanResults={data}
				filterType={filterType}
				sortType={sortType}
				onFilterChange={onFilterChange}
				onSortChange={onSortChange}
			/>

			{/* Table */}
			<div className="max-h-[400px] overflow-y-auto border-y-0 border-dashed sm:max-h-[600px] md:border-y">
				{isLoading ? (
					<ResponsiveLayout>
						<DesktopView>
							<Table>
								<TableHeader className="sticky top-0 z-10">
									<TableRow>
										<TableHead className="w-12 text-center text-xs sm:text-sm">
											No
										</TableHead>
										<TableHead className="text-xs sm:text-sm">
											Attendee
										</TableHead>
										<TableHead className="hidden text-xs sm:text-sm md:table-cell">
											Event
										</TableHead>
										<TableHead className="hidden text-xs sm:table-cell sm:text-sm">
											Ticket Type
										</TableHead>
										<TableHead className="hidden text-xs sm:text-sm lg:table-cell">
											Ticket ID
										</TableHead>
										<TableHead className="whitespace-nowrap text-xs sm:text-sm">
											Check-In Time
										</TableHead>
										<TableHead className="text-xs sm:text-sm">Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{skeletonRows.map((row) => (
										<TableRowSkeleton key={row.id} />
									))}
								</TableBody>
							</Table>
						</DesktopView>
						<MobileView>
							<div className="space-y-2 p-4">
								{skeletonRows.map((row) => (
									<ScanItemSkeleton key={row.id} />
								))}
							</div>
						</MobileView>
						<TabletView>
							<div className="grid grid-cols-2 gap-4 p-4">
								{skeletonRows.map((row) => (
									<ScanItemSkeleton key={row.id} />
								))}
							</div>
						</TabletView>
					</ResponsiveLayout>
				) : filteredRows.length === 0 ? (
					<div className="flex items-center justify-center p-8 sm:p-12">
						<EmptyState
							title={data.length > 0 ? "No Results Found" : "No Scans Yet"}
							description={
								data.length > 0
									? "Try adjusting your search or filters"
									: "Scanned tickets will appear here in real-time"
							}
							icon={<ScanLine />}
							height="h-auto"
						/>
					</div>
				) : (
					<ResponsiveLayout>
						<DesktopView>
							{/* Desktop: Table view with recentScan highlighting */}
							<Table>
								<TableHeader className="sticky top-0 z-10 bg-background">
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												return (
													<TableHead
														key={header.id}
														style={{ width: `${header.getSize()}px` }}
														className={cn(
															header.index === 0 && "ps-3",
															header.column.columnDef.meta?.sticky === "left" &&
																"sticky left-0 z-10 bg-background",
															header.column.columnDef.meta?.sticky ===
																"right" && "sticky right-0 z-10 bg-background",
														)}
													>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{filteredRows.map((row) => {
										const result = row.original;
										const isRecent = recentScan === result;
										return (
											<TableRow
												key={row.id}
												className={cn(
													"transition-colors",
													isRecent && "animate-pulse bg-primary/5",
												)}
											>
												{row.getVisibleCells().map((cell) => (
													<TableCell
														key={cell.id}
														style={{ width: `${cell.column.getSize()}px` }}
														className={cn(
															table.getVisibleLeafColumns()[0]?.id ===
																cell.column.id && "ps-4",
															cell.column.columnDef.meta?.sticky === "left" &&
																"sticky left-0 z-10 bg-background",
															cell.column.columnDef.meta?.sticky === "right" &&
																"sticky right-0 z-10 bg-background",
														)}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												))}
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</DesktopView>
						<MobileView>
							{/* Mobile: Single column list */}
							<div className="space-y-2">
								{filteredRows.map((row) => {
									const result = row.original;
									const isRecent = recentScan === result;
									return (
										<ScanItem
											key={row.id}
											scanResult={result}
											isRecent={isRecent}
										/>
									);
								})}
							</div>
						</MobileView>
						<TabletView>
							{/* Tablet: 2-column grid */}
							<div className="grid grid-cols-2 gap-4 p-0">
								{filteredRows.map((row) => {
									const result = row.original;
									const isRecent = recentScan === result;
									return (
										<ScanItem
											key={row.id}
											scanResult={result}
											isRecent={isRecent}
										/>
									);
								})}
							</div>
						</TabletView>
					</ResponsiveLayout>
				)}
			</div>
			{/* Pagination */}
			{!isLoading && filteredRows.length > 0 && (
				<DataPagination table={table} />
			)}
		</Card>
	);
}
