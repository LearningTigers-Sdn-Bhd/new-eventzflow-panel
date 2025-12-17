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
import { Calendar } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import InfoForm from "./event-location-action-modal/create-event-location-form";
import { LocationItem } from "./event-location-item";
import type { BaseLocation } from "./event-location-table-columns";
import { DataControl } from "./event-location-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const { isMobile, isDesktop } = useResponsiveDeterminer();
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
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No locations found",
							desc: isVendor
								? "You haven't been assigned to any locations yet"
								: "Create your first location to get started",
							icon: <Calendar />,
							action: !isVendor ? (
								<Button onClick={openLocationCreate}>Create Location</Button>
							) : undefined,
						}}
					/>
				) : isMobile ? (
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
				) : (
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
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
