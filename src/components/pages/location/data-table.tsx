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
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import type { BaseLocation } from "./columns";
import { DataControl } from "./data-control";
import { LocationItem } from "./location-item";
import InfoForm from "./page-action/info-form";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const isVendor = user?.role === "vendor";

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const openLocationCreate = () => {
		openDialog({
			component: InfoForm,
			config: {
				title: "Create Location",
			},
		});
	};

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
			<DataControl table={table} />

			{/* Data Table */}
			<div className="min-h-[45vh]">
				{!_isMobile && !isTablet ? (
					<div className="overflow-x-auto rounded-none border">
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
												title="No locations found"
												description={
													isVendor
														? "You haven't been assigned to any locations yet"
														: "Create your first location to get started"
												}
												icon={<Calendar />}
												height="h-auto"
												action={
													!isVendor ? (
														<Button onClick={openLocationCreate}>
															Create Location
														</Button>
													) : undefined
												}
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : isTablet && !_isMobile ? (
					table.getRowModel().rows?.length ? (
						<div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
							{table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<LocationItem location={row.original as BaseLocation} />
								</div>
							))}
						</div>
					) : (
						<EmptyState
							title="No locations found"
							description={
								isVendor
									? "You haven't been assigned to any locations yet"
									: "Create your first location to get started"
							}
							icon={<Calendar />}
							height="h-auto"
							action={
								!isVendor ? (
									<Button onClick={openLocationCreate}>Create Location</Button>
								) : undefined
							}
						/>
					)
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<LocationItem
										key={row.id}
										location={row.original as BaseLocation}
									/>
								))
						) : (
							<EmptyState
								title="No locations found"
								description={
									isVendor
										? "You haven't been assigned to any locations yet"
										: "Create your first location to get started"
								}
								icon={<Calendar />}
								height="h-auto"
								action={
									!isVendor ? (
										<Button onClick={openLocationCreate}>
											Create Location
										</Button>
									) : undefined
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
