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
import { Printer, Plus } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import type { EventPrintingService } from "@/lib/api/event-printing-service";
import { DataControl } from "./data-control";
import { EventPrintingServiceCard } from "./event-printing-service-card";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onLinkService: () => void;
	availableServicesCount: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onLinkService,
	availableServicesCount,
}: DataTableProps<TData, TValue>) {
	const isTablet = useIsTablet();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

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
			<div className="min-h-[45vh]">
				{!isTablet ? (
					<div className="overflow-hidden rounded-none border">
						<Table className="w-full">
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												style={{ width: `${header.getSize()}px` }}
												className={cn(header.index === 0 && "ps-3")}
											>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													style={{ width: `${cell.column.getSize()}px` }}
													className={cn(table.getVisibleLeafColumns()[0]?.id === cell.column.id && "ps-4")}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={columns.length} className="h-24 text-center">
											<EmptyState
												title="No services linked"
												description="Link services from your catalog to make them available for this event."
												icon={<Printer />}
												height="h-auto"
												action={
													<Button onClick={onLinkService} disabled={availableServicesCount === 0} className="rounded-none">
														<Plus className="mr-2 h-4 w-4" />
														Link Service
													</Button>
												}
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<EventPrintingServiceCard key={row.id} service={row.original as EventPrintingService} />
							))
						) : (
							<EmptyState
								title="No services linked"
								description="Link services from your catalog to make them available for this event."
								icon={<Printer />}
								height="h-auto"
								action={
									<Button onClick={onLinkService} disabled={availableServicesCount === 0} className="rounded-none">
										<Plus className="mr-2 h-4 w-4" />
										Link Service
									</Button>
								}
							/>
						)}
					</div>
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
