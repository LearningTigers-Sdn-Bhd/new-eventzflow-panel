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
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { ItemSeparator } from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import { usePersistedColumnOrder } from "@/hooks/use-persisted-column-order";
import {
	hasSavedColumnVisibility,
	usePersistedColumnVisibility,
} from "@/hooks/use-persisted-column-visibility";
import { getEventById } from "@/lib/api/event";
import PendingTicketForm from "./page-action/create-pending-ticket-form";
import { PendingTicketItem } from "./pending-ticket-item";
import type { PendingTicket } from "./pending-ticket-table-columns";
import { generateColumns } from "./pending-ticket-table-columns";
import { DataControl } from "./pending-ticket-table-control";

const PENDING_TICKETS_VISIBILITY_KEY = "pending-tickets-column-visibility";

interface DataTableProps<TData> {
	data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
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

	// Merge labels_data keys with any custom label keys found in ticket data
	const mergedLabelsData = React.useMemo(() => {
		const base: Record<string, string> = { ...(eventData?.labels_data ?? {}) };
		(data as PendingTicket[]).forEach((ticket) => {
			ticket.customLabels?.forEach(({ name }) => {
				if (!(name in base)) {
					base[name] = name
						.replace(/_/g, " ")
						.replace(/\b\w/g, (c) => c.toUpperCase());
				}
			});
		});
		return Object.keys(base).length > 0 ? base : undefined;
	}, [eventData?.labels_data, data]);

	// Generate initial visibility state for custom columns
	// Show first 3 labels by default, hide the rest if there are more than 3
	const initialVisibility = React.useMemo(() => {
		const visibility: VisibilityState = {
			phone: false, // Hide phone column as it's only used for search
		};

		if (mergedLabelsData) {
			const labelKeys = Object.keys(mergedLabelsData);
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
	}, [mergedLabelsData]);

	const [columnVisibility, setColumnVisibility, resetColumnVisibility] =
		usePersistedColumnVisibility(
			PENDING_TICKETS_VISIBILITY_KEY,
			initialVisibility,
		);

	const [columnOrder, setColumnOrder, resetColumnOrder] =
		usePersistedColumnOrder("pending-tickets-column-order");

	// Apply the computed default (first 3 custom labels visible) only when
	// the user hasn't saved a visibility preference yet.
	React.useEffect(() => {
		if (hasSavedColumnVisibility(PENDING_TICKETS_VISIBILITY_KEY)) return;
		setColumnVisibility(initialVisibility);
	}, [initialVisibility, setColumnVisibility]);

	const resetColumnPreferences = () => {
		resetColumnVisibility(initialVisibility);
		resetColumnOrder();
	};

	const hasApplicationWorkflow = React.useMemo(
		() =>
			(data as PendingTicket[]).some(
				(ticket) => ticket.ticketApplication != null,
			),
		[data],
	);

	const columns = React.useMemo(
		() =>
			generateColumns(
				mergedLabelsData,
				hasApplicationWorkflow,
			) as ColumnDef<TData>[],
		[mergedLabelsData, hasApplicationWorkflow],
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
		onColumnOrderChange: setColumnOrder,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			columnOrder,
		},
	});

	return (
		<div className="w-full">
			<DataControl
				table={table}
				labelsData={mergedLabelsData}
				hasApplicationWorkflow={hasApplicationWorkflow}
				onResetColumns={resetColumnPreferences}
			/>

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					{/* Data Table */}
					<DesktopView>
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
					</DesktopView>
					<MobileView>
						<div className="flex flex-col border-t">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<React.Fragment key={row.id}>
										<PendingTicketItem
											ticket={row.original as PendingTicket}
											labelsData={mergedLabelsData}
										/>
										<ItemSeparator className="opacity-50" />
									</React.Fragment>
								))
							) : (
								<div className="p-4">
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
								</div>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-2">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<PendingTicketItem
											ticket={row.original as PendingTicket}
											labelsData={mergedLabelsData}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
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
