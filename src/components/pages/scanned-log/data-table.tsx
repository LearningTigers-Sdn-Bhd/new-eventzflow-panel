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
	type VisibilityState,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
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
import type { ScannedLog } from "./columns";
import { DataControl } from "./data-control";
import { ScannedLogItem } from "./log-item";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	eventId: string;
	onRefetch?: () => void;
	canScanTickets?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	eventId,
	onRefetch,
	canScanTickets = false,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
	const isTablet = useIsTablet();

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
			{/* Control Panel */}
			<DataControl 
				table={table} 
				eventId={eventId} 
				onRefetch={onRefetch}
				canScanTickets={canScanTickets}
			/>

			{/* Data Table */}
			{!_isMobile && !isTablet ? (
				<div className="overflow-hidden rounded-md border">
					<Table className="w-full table-fixed">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												style={{ width: `${header.getSize()}px` }}
												className={cn(header.index === 0 && "ps-3")}
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
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												style={{ width: `${cell.column.getSize()}px` }}
												className={cn(
													table.getVisibleLeafColumns()[0]?.id ===
														cell.column.id && "ps-4",
												)}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<EmptyState
											title="No scanned logs found"
											description="No scan logs available for this event yet"
											icon={<Calendar />}
											height="h-auto"
										/>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			) : isTablet && !_isMobile ? (
				<div className="grid grid-cols-2 gap-4">
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<div key={row.id} className="col-span-1">
								<ScannedLogItem scannedLog={row.original as ScannedLog} />
							</div>
						))
					) : (
						<EmptyState
							title="No scanned logs found"
							description="No scan logs available for this event yet"
							icon={<Calendar />}
							height="h-auto"
						/>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{table.getRowModel().rows?.length ? (
						table
							.getRowModel()
							.rows.map((row) => (
								<ScannedLogItem
									key={row.id}
									scannedLog={row.original as ScannedLog}
								/>
							))
					) : (
						<EmptyState
							title="No scanned logs found"
							description="No scan logs available for this event yet"
							icon={<Calendar />}
							height="h-auto"
						/>
					)}
				</div>
			)}

			<DataPagination table={table} />
		</div>
	);
}
