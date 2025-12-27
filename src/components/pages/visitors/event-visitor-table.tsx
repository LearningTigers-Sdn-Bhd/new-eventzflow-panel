"use client";

import { useQuery } from "@tanstack/react-query";
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
import { Users } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { getEventById } from "@/lib/api/event";
import type { Visitor } from "@/lib/api/visitor";
import { VisitorItem } from "./event-visitor-item";
import { generateColumns } from "./event-visitor-table-columns";
import { DataControl } from "./event-visitor-table-control";

interface DataTableProps {
	eventId: number;
	data: Visitor[];
}

export function VisitorsDataTable({ eventId, data }: DataTableProps) {
	const params = useParams();
	const eventIdParam = params.event_id as string;

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	// Fetch event data for labels
	const { data: eventData } = useQuery({
		queryKey: ["event", eventIdParam],
		queryFn: () => getEventById(eventIdParam),
		enabled: !!eventIdParam,
	});

	// Initialize with default visibility (phone is always hidden)
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			phone: false, // Hide phone column by default
		});

	// Generate visibility state for custom columns when eventData is available
	// Show first 3 labels by default, hide the rest if there are more than 3
	React.useEffect(() => {
		if (!eventData?.labels_data) return;

		const visibility: VisibilityState = {
			phone: false, // Hide phone column as it's only used for search
		};

		const labelKeys = Object.keys(eventData.labels_data);
		const totalLabels = labelKeys.length;

		labelKeys.forEach((key, index) => {
			// Show first 3 labels, hide the rest if there are more than 3
			if (totalLabels <= 3) {
				visibility[`custom_${key}`] = true; // Show all if 3 or fewer
			} else {
				visibility[`custom_${key}`] = index < 3; // Show first 3, hide rest
			}
		});

		setColumnVisibility(visibility);
	}, [eventData?.labels_data]);

	const columns = React.useMemo(
		() => generateColumns(eventData?.labels_data) as ColumnDef<Visitor>[],
		[eventData?.labels_data],
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
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div className="w-full">
			<DataControl
				table={table}
				eventId={eventId}
				labelsData={eventData?.labels_data}
			/>

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No visitors found",
								desc: "Add your first visitor to get started",
								icon: <Users />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="grid grid-cols-1 gap-4">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<VisitorItem
											key={row.id}
											visitor={row.original as Visitor}
											labelsData={eventData?.labels_data}
										/>
									))
							) : (
								<EmptyState
									title="No visitors found"
									description="Add your first visitor to get started"
									icon={<Users />}
									height="h-auto"
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<VisitorItem
											visitor={row.original as Visitor}
											labelsData={eventData?.labels_data}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No visitors found"
										description="Add your first visitor to get started"
										icon={<Users />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
