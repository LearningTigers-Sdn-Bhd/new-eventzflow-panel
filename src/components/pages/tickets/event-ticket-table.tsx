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
import { Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { getEventById } from "@/lib/api/event";
import { TicketItem } from "./event-ticket-item";
import type { BaseTicket } from "./event-ticket-table-columns";
import { generateColumns } from "./event-ticket-table-columns";
import { DataControl } from "./event-ticket-table-control";

type TicketFilter = "active" | "archived" | "all";

interface DataTableProps<TData> {
	data: TData[];
	ticketFilter?: TicketFilter;
	onTicketFilterChange?: (filter: TicketFilter) => void;
}

export function DataTable<TData>({
	data,
	ticketFilter = "active",
	onTicketFilterChange,
}: DataTableProps<TData>) {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const params = useParams();
	const eventId = params.event_id as string;

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Initialize with default visibility (phone is always hidden)
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			phone: false, // Hide phone column as it's only used for search
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
		() => generateColumns(eventData?.labels_data) as ColumnDef<TData>[],
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
				labelsData={eventData?.labels_data}
				ticketFilter={ticketFilter}
				onTicketFilterChange={onTicketFilterChange}
			/>

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{!isMobile && !isTablet ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No tickets found",
							desc: "Create your first ticket to get started",
							icon: <Calendar />,
							action: <Button>Create Ticket</Button>,
						}}
					/>
				) : isTablet && !isMobile ? (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<TicketItem
										ticket={row.original as BaseTicket}
										labelsData={eventData?.labels_data}
									/>
								</div>
							))
						) : (
							<EmptyState
								title="No tickets found"
								description="Create your first ticket to get started"
								icon={<Calendar />}
								height="h-auto"
								action={<Button>Create Ticket</Button>}
							/>
						)}
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<TicketItem
										key={row.id}
										ticket={row.original as BaseTicket}
										labelsData={eventData?.labels_data}
									/>
								))
						) : (
							<EmptyState
								title="No tickets found"
								description="Create your first ticket to get started"
								icon={<Calendar />}
								height="h-auto"
								action={<Button>Create Ticket</Button>}
							/>
						)}
					</div>
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
