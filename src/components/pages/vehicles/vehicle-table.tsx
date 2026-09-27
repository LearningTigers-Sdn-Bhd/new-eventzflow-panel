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
import { Car } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { ItemSeparator } from "@/components/ui/item";
import type { VehicleRegistration } from "@/lib/api/vehicle-registration";
import { VehicleDetailSheet } from "./vehicle-detail-sheet";
import { VehicleItem } from "./vehicle-item";
import { generateColumns } from "./vehicle-table-columns";
import { DataControl } from "./vehicle-table-control";

type ArchivedFilter = "active" | "archived";

interface VehicleTableProps {
	eventId: string;
	vehicles: VehicleRegistration[];
	archivedFilter?: ArchivedFilter;
	onArchivedFilterChange?: (filter: ArchivedFilter) => void;
}

export function VehicleTable({
	eventId,
	vehicles,
	archivedFilter = "active",
	onArchivedFilterChange,
}: VehicleTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	// Hidden columns carry the search/group/issues filter state — they must
	// never render as table cells.
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			crewSearch: false,
			group: false,
			issueCount: false,
		});

	const columns = React.useMemo(() => generateColumns(eventId), [eventId]);

	const [selectedVehicle, setSelectedVehicle] =
		React.useState<VehicleRegistration | null>(null);

	const table = useReactTable({
		data: vehicles,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	const rows = table.getRowModel().rows;

	return (
		<div className="w-full">
			<DataControl
				table={table}
				archivedFilter={archivedFilter}
				onArchivedFilterChange={onArchivedFilterChange}
			/>

			<ResponsiveLayout>
				<DesktopView>
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No vehicles found",
							desc: "No vehicles match the current filters.",
							icon: <Car className="h-10 w-10" />,
						}}
						clickableRowConfig={{
							isEnabled: true,
							onRowClick: (vehicle) => setSelectedVehicle(vehicle),
							excludeRowClickColumns: ["actions"],
						}}
					/>
				</DesktopView>

				<MobileView>
					<div className="flex flex-col border-t">
						{rows.map((row) => (
							<React.Fragment key={row.original.id}>
								<VehicleItem
									eventId={eventId}
									vehicle={row.original}
									onView={setSelectedVehicle}
								/>
								<ItemSeparator />
							</React.Fragment>
						))}
					</div>
				</MobileView>

				<TabletView>
					<div className="grid grid-cols-2 gap-4">
						{rows.map((row) => (
							<div
								key={row.original.id}
								className="col-span-1 rounded-none border"
							>
								<VehicleItem
									eventId={eventId}
									vehicle={row.original}
									onView={setSelectedVehicle}
								/>
							</div>
						))}
					</div>
				</TabletView>
			</ResponsiveLayout>

			<DataPagination table={table} />
			<VehicleDetailSheet
				vehicle={selectedVehicle}
				onOpenChange={(open) => !open && setSelectedVehicle(null)}
			/>
		</div>
	);
}
