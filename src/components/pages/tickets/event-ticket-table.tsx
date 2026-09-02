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
import { TicketItem } from "./event-ticket-item";
import type { BaseTicket } from "./event-ticket-table-columns";
import { generateColumns } from "./event-ticket-table-columns";
import { DataControl } from "./event-ticket-table-control";
import TicketForm from "./page-action/create-event-ticket-form";

type TicketFilter = "active" | "archived" | "all";

const MANAGE_TICKETS_VISIBILITY_KEY = "manage-tickets-column-visibility";

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
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog } = useDialog();

	const openTicketCreate = () => {
		openDialog({
			component: TicketForm,
			config: {
				size: "full",
				showCloseButton: true,
				title: "Create New Ticket",
				description: "Add a new ticket for this event",
			},
		});
	};

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Initialize with default visibility (phone is always hidden)
	const [columnVisibility, setColumnVisibility, resetColumnVisibility] =
		usePersistedColumnVisibility(MANAGE_TICKETS_VISIBILITY_KEY, {
			phone: false, // Hide phone column as it's only used for search
		});

	const [columnOrder, setColumnOrder, resetColumnOrder] =
		usePersistedColumnOrder("manage-tickets-column-order");

	// Merge labels_data keys with any custom label keys found in ticket data
	const mergedLabelsData = React.useMemo(() => {
		const base: Record<string, string> = { ...(eventData?.labels_data ?? {}) };
		(data as BaseTicket[]).forEach((ticket) => {
			ticket.customLabels?.forEach(({ name }) => {
				// Skip server-written/reserved fields (e.g. `_table_number`,
				// `_indemnity`) - they aren't user-facing custom fields and
				// would otherwise show up as duplicate/confusing columns.
				if (name.startsWith("_")) return;
				if (!(name in base)) {
					// Prettify raw key: ic_no -> Ic No, t_shirt_size -> T Shirt Size
					base[name] = name
						.replace(/_/g, " ")
						.replace(/\b\w/g, (c) => c.toUpperCase());
				}
			});
		});
		return Object.keys(base).length > 0 ? base : undefined;
	}, [eventData?.labels_data, data]);

	// Default visibility: show first 3 custom labels, hide the rest if there
	// are more than 3. Reused by both the auto-apply effect (first load) and
	// the "Reset to default" action.
	const defaultVisibility = React.useMemo<VisibilityState>(() => {
		const visibility: VisibilityState = {
			phone: false, // Hide phone column as it's only used for search
		};
		if (!mergedLabelsData) return visibility;

		// participation_category has its own fixed, always-visible column
		// (see event-ticket-table-columns.tsx) so it's excluded here.
		const labelKeys = Object.keys(mergedLabelsData).filter(
			(key) => key !== "participation_category",
		);
		const totalLabels = labelKeys.length;

		labelKeys.forEach((key, index) => {
			// Show first 3 labels, hide the rest if there are more than 3
			if (totalLabels <= 3) {
				visibility[`custom_${key}`] = true; // Show all if 3 or fewer
			} else {
				visibility[`custom_${key}`] = index < 3; // Show first 3, hide rest
			}
		});

		return visibility;
	}, [mergedLabelsData]);

	// Apply the computed default only when the user hasn't saved a
	// visibility preference yet.
	React.useEffect(() => {
		if (
			!mergedLabelsData ||
			hasSavedColumnVisibility(MANAGE_TICKETS_VISIBILITY_KEY)
		)
			return;
		setColumnVisibility(defaultVisibility);
	}, [mergedLabelsData, defaultVisibility, setColumnVisibility]);

	const resetColumnPreferences = () => {
		resetColumnVisibility(defaultVisibility);
		resetColumnOrder();
	};

	const columns = React.useMemo(
		() => generateColumns(mergedLabelsData) as ColumnDef<TData>[],
		[mergedLabelsData],
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
				ticketFilter={ticketFilter}
				onTicketFilterChange={onTicketFilterChange}
				onResetColumns={resetColumnPreferences}
			/>

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No tickets found",
								desc: "Create your first ticket to get started",
								icon: <Calendar />,
								action: (
									<Button onClick={openTicketCreate}>Create Ticket</Button>
								),
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="flex flex-col border-t">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<React.Fragment key={row.id}>
										<TicketItem
											ticket={row.original as BaseTicket}
											labelsData={mergedLabelsData}
										/>
										<ItemSeparator className="opacity-50" />
									</React.Fragment>
								))
							) : (
								<div className="p-4">
									<EmptyState
										title="No tickets found"
										description="Create your first ticket to get started"
										icon={<Calendar />}
										height="h-auto"
										action={
											<Button onClick={openTicketCreate}>Create Ticket</Button>
										}
									/>
								</div>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<TicketItem
											ticket={row.original as BaseTicket}
											labelsData={mergedLabelsData}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No tickets found"
										description="Create your first ticket to get started"
										icon={<Calendar />}
										height="h-auto"
										action={
											<Button onClick={openTicketCreate}>Create Ticket</Button>
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
