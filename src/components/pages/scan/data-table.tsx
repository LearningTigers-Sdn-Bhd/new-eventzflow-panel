"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { DataControl } from "./data-control";
import { EmptyState } from "./empty-state";
import { ScanItem } from "./scan-item";
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
	const _isMobile = useIsMobile();
	const isTablet = useIsTablet();
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
			<div className="max-h-[400px] overflow-y-auto border-y border-dashed sm:max-h-[600px]">
				{isLoading ? (
					<Table>
						<TableHeader className="sticky top-0 z-10">
							<TableRow>
								<TableHead className="w-12 text-center text-xs sm:text-sm">
									No
								</TableHead>
								<TableHead className="text-xs sm:text-sm">Attendee</TableHead>
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
				) : filteredRows.length === 0 ? (
					<div className="flex items-center justify-center p-8 sm:p-12">
						<EmptyState hasScans={data.length > 0} />
					</div>
				) : !_isMobile && !isTablet ? (
					// Desktop: Table view
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-background">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												className={cn(
													header.id === "index" && "w-12 text-center",
													header.id === "attendeeName" && "text-xs sm:text-sm",
													header.id === "eventName" &&
														"hidden text-xs sm:text-sm md:table-cell",
													header.id === "ticketType" &&
														"hidden text-xs sm:table-cell sm:text-sm",
													header.id === "ticketId" &&
														"hidden text-xs sm:text-sm lg:table-cell",
													header.id === "timestamp" &&
														"whitespace-nowrap text-xs sm:text-sm",
													header.id === "status" && "text-xs sm:text-sm",
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
											<TableCell key={cell.id}>
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
				) : isTablet && !_isMobile ? (
					// Tablet: 2-column grid
					<div className="grid grid-cols-2 gap-4 p-4">
						{filteredRows.map((row) => {
							const result = row.original;
							const isRecent = recentScan === result;
							return (
								<div key={row.id} className="col-span-1">
									<ScanItem scanResult={result} isRecent={isRecent} />
								</div>
							);
						})}
					</div>
				) : (
					// Mobile: Single column list
					<div className="space-y-2 p-4">
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
				)}
			</div>
		</Card>
	);
}
