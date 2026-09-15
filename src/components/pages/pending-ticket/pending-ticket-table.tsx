"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
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
import {
	reconcileColumnOrder,
	usePersistedColumnOrder,
} from "@/hooks/use-persisted-column-order";
import {
	hasSavedColumnVisibility,
	usePersistedColumnVisibility,
} from "@/hooks/use-persisted-column-visibility";
import { getEventById } from "@/lib/api/event";
import PendingTicketForm from "./page-action/create-pending-ticket-form";
import { PendingTicketDetailSheet } from "./pending-ticket-detail-sheet";
import { PendingTicketItem } from "./pending-ticket-item";
import type { PendingTicket } from "./pending-ticket-table-columns";
import { generateColumns } from "./pending-ticket-table-columns";
import { DataControl } from "./pending-ticket-table-control";

const PENDING_TICKETS_VISIBILITY_KEY = "pending-tickets-column-visibility";

interface ServerPagination {
	pageIndex: number;
	pageSize: number;
	pageCount: number;
	totalCount: number;
	onPageChange: (pageIndex: number) => void;
	onPageSizeChange: (size: number) => void;
}

type PendingTicketFilter = "active" | "archived" | "all";

interface DataTableProps<TData> {
	data: TData[];
	pendingTicketFilter?: PendingTicketFilter;
	onPendingTicketFilterChange?: (filter: PendingTicketFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	columnFilters: ColumnFiltersState;
	onColumnFiltersChange: (
		updater:
			| ColumnFiltersState
			| ((prev: ColumnFiltersState) => ColumnFiltersState),
	) => void;
	// Search/status/review/rsvp/type filtering and paging all happen
	// server-side (see pending-tickets/page.tsx) — `data` here is always
	// exactly one page.
	pagination: ServerPagination;
	sorting: SortingState;
	onSortingChange: (
		updater: SortingState | ((prev: SortingState) => SortingState),
	) => void;
}

export function DataTable<TData>({
	data,
	pendingTicketFilter = "active",
	onPendingTicketFilterChange,
	search,
	onSearchChange,
	columnFilters,
	onColumnFiltersChange,
	pagination,
	sorting,
	onSortingChange,
}: DataTableProps<TData>) {
	const { openDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const [selectedTicket, setSelectedTicket] =
		React.useState<PendingTicket | null>(null);

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

	// Review/RSVP columns and filters always render — a single event can mix
	// tickets that carry a ticket_application with ones that don't (gated per
	// registration form + per free/paid ticket type, not per event; see
	// registrations_controller.rb#handle_ticket_application!), so there's no
	// reliable "does this event use the application workflow" flag to hide
	// them on, whether computed from the loaded page or the full set. Tickets
	// without an application just render "-" in those columns (see
	// pending-ticket-table-columns.tsx).
	const columns = React.useMemo(
		() => generateColumns(mergedLabelsData) as ColumnDef<TData>[],
		[mergedLabelsData],
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

	// Manual pagination: search, status/review/rsvp/type filters, and paging
	// are all server-driven (pending-tickets/page.tsx), so `data` here is
	// already exactly one page. Mirror the server's pagination state into the
	// table via `manualPagination` + `pageCount` (never getPaginationRowModel,
	// which would slice the page again to TanStack's default size of 10).
	// Sorting is also server-driven (manualSorting) so it orders the whole
	// pending-ticket list, not just the rows on this page.
	const paginationState: PaginationState = {
		pageIndex: pagination.pageIndex,
		pageSize: pagination.pageSize,
	};

	// Reconcile the saved order against the current columns so newly-added
	// columns (e.g. custom labels) never land after sticky-right Actions.
	const effectiveColumnOrder = React.useMemo(
		() => reconcileColumnOrder(columnOrder, columns),
		[columnOrder, columns],
	);

	const table = useReactTable({
		data,
		columns,
		onSortingChange,
		onColumnFiltersChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange: setColumnOrder,
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		pageCount: pagination.pageCount,
		onPaginationChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(paginationState) : updater;
			pagination.onPageChange(next.pageIndex);
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			columnOrder: effectiveColumnOrder,
			pagination: paginationState,
		},
	});

	return (
		<div className="w-full">
			<DataControl
				table={table}
				labelsData={mergedLabelsData}
				pendingTicketFilter={pendingTicketFilter}
				onPendingTicketFilterChange={onPendingTicketFilterChange}
				onResetColumns={resetColumnPreferences}
				search={search}
				onSearchChange={onSearchChange}
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
							clickableRowConfig={{
								isEnabled: true,
								onRowClick: (row) => setSelectedTicket(row as PendingTicket),
								excludeRowClickColumns: ["actions"],
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
											onView={setSelectedTicket}
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
											onView={setSelectedTicket}
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
			<DataPagination
				table={table}
				totalRows={pagination.totalCount}
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.onPageSizeChange}
			/>
			<PendingTicketDetailSheet
				ticket={selectedTicket}
				onOpenChange={(open) => !open && setSelectedTicket(null)}
			/>
		</div>
	);
}
