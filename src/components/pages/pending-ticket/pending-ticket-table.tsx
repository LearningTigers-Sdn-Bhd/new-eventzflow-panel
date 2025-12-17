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
import { useDialog } from "@/hooks/use-dialog";
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import { getEventById } from "@/lib/api/event";
import PendingTicketForm from "./page-action/create-pending-ticket-form";
import { PendingTicketItem } from "./pending-ticket-item";
import type { PendingTicket } from "./pending-ticket-table-columns";
import { generateColumns } from "./pending-ticket-table-columns";
import { DataControl } from "./pending-ticket-table-control";

interface DataTableProps<TData> {
	data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
	const { isMobile, isDesktop } = useResponsiveDeterminer();
	const { openDialog } = useDialog();
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

	// Generate initial visibility state for custom columns
	// Show first 3 labels by default, hide the rest if there are more than 3
	const initialVisibility = React.useMemo(() => {
		const visibility: VisibilityState = {
			phone: false, // Hide phone column as it's only used for search
		};

		if (eventData?.labels_data) {
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
		}

		return visibility;
	}, [eventData?.labels_data]);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>(initialVisibility);

	// Update visibility when labels data changes
	React.useEffect(() => {
		setColumnVisibility(initialVisibility);
	}, [initialVisibility]);

	const columns = React.useMemo(
		() => generateColumns(eventData?.labels_data) as ColumnDef<TData>[],
		[eventData?.labels_data],
	);

	const openPendingTicketCreate = () => {
		openDialog({
			component: PendingTicketForm,
			config: {
				title: "Create Pending Ticket",
				description: "Create a new pending ticket for your event.",
				size: "full",
				showCloseButton: false,
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
			<DataControl table={table} labelsData={eventData?.labels_data} />

			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{/* Data Table */}
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No pending tickets found",
							desc: "Create your first pending ticket to get started",
							icon: <Calendar />,
							action: (
								<Button onClick={openPendingTicketCreate}>
									Create Pending Ticket
								</Button>
							),
						}}
					/>
				) : isMobile ? (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<PendingTicketItem
										key={row.id}
										ticket={row.original as PendingTicket}
										labelsData={eventData?.labels_data}
									/>
								))
						) : (
							<EmptyState
								title="No pending tickets found"
								description="Create your first pending ticket to get started"
								icon={<Calendar />}
								height="h-auto"
								action={
									<Button onClick={openPendingTicketCreate}>
										Create Pending Ticket
									</Button>
								}
							/>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-2">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<PendingTicketItem
										ticket={row.original as PendingTicket}
										labelsData={eventData?.labels_data}
									/>
								</div>
							))
						) : (
							<EmptyState
								title="No pending tickets found"
								description="Create your first pending ticket to get started"
								icon={<Calendar />}
								height="h-auto"
								action={
									<Button onClick={openPendingTicketCreate}>
										Create Pending Ticket
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
