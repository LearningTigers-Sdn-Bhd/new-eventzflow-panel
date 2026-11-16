"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
	AlertTriangle,
	ChevronDown,
	Download,
	ListChecks,
	Users,
	Wrench,
} from "lucide-react";
import { use, useCallback, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { JsonSampleTool } from "@/components/json-sample-tool";
import TicketGroupsDialog from "@/components/pages/event-ticket-groups/ticket-groups-view";
import { ImportDataDialog } from "@/components/pages/import/import-data-dialog";
import { DataTable } from "@/components/pages/tickets/event-ticket-table";
import { TicketPageButton } from "@/components/pages/tickets/page-action/create-event-ticket-button";
import GuestPassesForm from "@/components/pages/tickets/page-action/create-guest-passes-form";
import { downloadGuestPassQrZip } from "@/components/pages/tickets/page-action/guest-pass-qr-zip";
import { ImportTicketButton } from "@/components/pages/tickets/page-action/import-ticket";
import ResizeGuestPassesForm from "@/components/pages/tickets/page-action/resize-guest-passes-form";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { useDialog } from "@/hooks/use-dialog";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventById } from "@/lib/api/event";
import { getEventTicketsPaged } from "@/lib/api/ticket";
import { getTicketGroups } from "@/lib/api/ticket-group";

type TicketFilter = "active" | "archived" | "all";

const DEFAULT_PAGE_SIZE = 25;

// The "status"/"ticketTypeName" column filters carry these value shapes
// (string for status, string[] for ticket type — see
// event-ticket-table-control.tsx's setFilterValue calls).
function findColumnFilterValue(
	columnFilters: ColumnFiltersState,
	id: string,
): unknown {
	return columnFilters.find((f) => f.id === id)?.value;
}

const TICKET_BASE_FIELDS = [
	"attendee_name",
	"attendee_email",
	"attendee_phone",
	"ticket_type_id",
	"role",
	"payment_status",
];

export default function TicketsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { openDialog } = useDialog();
	const [ticketFilter, setTicketFilter] = useState<TicketFilter>("active");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = usePersistedState(
		`event-${event_id}-tickets-page-size`,
		DEFAULT_PAGE_SIZE,
	);
	const [search, setSearch] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [bulkSelectMode, setBulkSelectMode] = useState(false);

	const debouncedSearch = useDebounce(search, 300);

	const resetToFirstPage = () => setPage(1);

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		resetToFirstPage();
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		resetToFirstPage();
	};

	const handleColumnFiltersChange = (
		updater:
			| ColumnFiltersState
			| ((prev: ColumnFiltersState) => ColumnFiltersState),
	) => {
		setColumnFilters((prev) =>
			typeof updater === "function" ? updater(prev) : updater,
		);
		resetToFirstPage();
	};

	const handleTicketFilterChange = (filter: TicketFilter) => {
		setTicketFilter(filter);
		resetToFirstPage();
	};

	const handleSortingChange = (
		updater: SortingState | ((prev: SortingState) => SortingState),
	) => {
		setSorting((prev) =>
			typeof updater === "function" ? updater(prev) : updater,
		);
		resetToFirstPage();
	};

	const sort = sorting[0] as { id: string; desc: boolean } | undefined;
	// Column ids are either the fixed ones (name/email/status/createdAt) or
	// custom_<labels_data key> for the generated custom-field columns; the
	// backend understands both.
	const sortBy = sort?.id as
		| "name"
		| "email"
		| "status"
		| "createdAt"
		| `custom_${string}`
		| undefined;
	const sortDir = sort ? (sort.desc ? "desc" : "asc") : undefined;

	const statusFilter = findColumnFilterValue(columnFilters, "status") as
		| string
		| undefined;
	const ticketTypeFilter = findColumnFilterValue(
		columnFilters,
		"ticketTypeName",
	) as string[] | undefined;

	// Shares the cache with the table and the action menu.
	const { data: eventData } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});
	const { permissions } = useEventSidebarContext();
	// Same rule as the backend: org owner, organizer or this event's admin.
	const canManageGroups =
		permissions.isOrgOwner ||
		permissions.isOrganizer ||
		permissions.isEventAdmin;
	const ticketGroupsOn =
		eventData?.use_ticket_groups === true && canManageGroups;

	// Same cache as the Ticket Groups modal, so assigning there updates this.
	const { data: groupData } = useQuery({
		queryKey: ["ticket-groups", event_id],
		queryFn: () => getTicketGroups(event_id),
		enabled: ticketGroupsOn,
	});
	// With no groups yet every ticket is "unassigned", which is not worth a warning.
	const unassignedCount = groupData?.groups.length
		? groupData.unassigned_count
		: 0;

	const openTicketGroups = useCallback(
		() =>
			openDialog({
				component: TicketGroupsDialog,
				config: {
					size: "full",
					showCloseButton: true,
					title: "Ticket Groups",
					description:
						"Split paid tickets into groups (e.g. rooms), with a priority ticket type per group.",
				},
			}),
		[openDialog],
	);

	const ticketGroupFilter = findColumnFilterValue(
		columnFilters,
		"ticketGroup",
	) as string | undefined;

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="w-full rounded-none py-6 md:py-4 lg:w-auto"
						>
							<Wrench className="mr-2 h-4 w-4" />
							Tools
							{unassignedCount > 0 && (
								<span
									role="img"
									aria-label="Tickets not in a group"
									className="ml-2 size-2 rounded-full bg-amber-500"
								/>
							)}
							<ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48 rounded-none">
						<DropdownMenuItem
							onSelect={() => setBulkSelectMode((v) => !v)}
							className="rounded-none"
						>
							<ListChecks className="h-4 w-4" />
							{bulkSelectMode ? "Exit Bulk Actions" : "Bulk Actions"}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onSelect={() =>
								openDialog({
									component: GuestPassesForm,
									config: {
										size: "full",
										showCloseButton: true,
										title: "Create Guest Passes",
										description:
											"Placeholder passes for groups whose names aren't known or needed — rename later, or never.",
									},
								})
							}
							className="rounded-none"
						>
							<Users className="h-4 w-4" />
							Guest Passes
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() =>
								openDialog({
									component: ResizeGuestPassesForm,
									config: {
										size: "md",
										className: "rounded-none",
										showCloseButton: true,
										title: "Resize Guest Pack",
										description:
											"Add or remove passes in an existing company pack — existing QR codes stay valid.",
									},
								})
							}
							className="rounded-none"
						>
							<Users className="h-4 w-4" />
							Resize Guest Pack
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => downloadGuestPassQrZip(event_id)}
							className="rounded-none"
						>
							<Download className="h-4 w-4" />
							Guest QR ZIP
						</DropdownMenuItem>
						{ticketGroupsOn && (
							<DropdownMenuItem
								onSelect={openTicketGroups}
								className="rounded-none"
							>
								<Users className="h-4 w-4" />
								Ticket Groups
								{unassignedCount > 0 && (
									<span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900 text-xs">
										{unassignedCount}
									</span>
								)}
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<JsonSampleTool
							resourceName="Ticket"
							eventId={event_id}
							baseFields={TICKET_BASE_FIELDS}
							asMenuItem
						/>
						<DropdownMenuSeparator />
						<ImportTicketButton asMenuItem />
					</DropdownMenuContent>
				</DropdownMenu>
				{/* Rendered as a sibling of DropdownMenu, not inside DropdownMenuContent —
				    Radix unmounts the menu's content on close, which would close this
				    dialog before it ever showed. ImportTicketButton's menu item only
				    flips the shared full-screen dialog store. */}
				<ImportDataDialog
					importType="tickets"
					trigger={<span className="hidden" />}
					lockedEventId={event_id}
				/>
				<TicketPageButton />
			</div>
		),
		[
			event_id,
			bulkSelectMode,
			openDialog,
			ticketGroupsOn,
			unassignedCount,
			openTicketGroups,
		],
	);

	useSetEventActions(eventActions);

	const {
		data: result,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: [
			"event",
			event_id,
			"tickets",
			ticketFilter,
			page,
			pageSize,
			debouncedSearch,
			statusFilter,
			ticketTypeFilter,
			ticketGroupFilter,
			sortBy,
			sortDir,
		],
		queryFn: () =>
			getEventTicketsPaged(event_id, {
				page,
				perPage: pageSize,
				full: ticketFilter === "all",
				archived: ticketFilter === "archived",
				q: debouncedSearch || undefined,
				status: statusFilter as "scanned" | "not_scanned" | undefined,
				ticketTypeName: ticketTypeFilter?.[0],
				ticketGroupId: ticketGroupFilter,
				sortBy,
				sortDir,
			}),
		placeholderData: (previous) => previous,
	});

	return (
		<div className="space-y-4">
			{unassignedCount > 0 && (
				<div className="flex flex-wrap items-center gap-2 border-l-4 border-l-amber-500 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
					<AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
					<span className="text-amber-900 text-sm dark:text-amber-100">
						<strong>{unassignedCount}</strong> paid ticket
						{unassignedCount === 1 ? " is" : "s are"} not in a group yet.
					</span>
					<Button
						variant="outline"
						size="sm"
						className="ml-auto rounded-none"
						onClick={openTicketGroups}
					>
						Open Ticket Groups
					</Button>
				</div>
			)}
			{isLoading && !result ? (
				<LoadingState
					title="Loading tickets..."
					description="Please wait while we fetch your tickets..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load tickets"
					description={
						error?.message || "We couldn't load tickets. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<DataTable
					data={(result?.data ?? []).map((t) => ({
						...t,
						phone: t.phone || "",
					}))}
					ticketFilter={ticketFilter}
					onTicketFilterChange={handleTicketFilterChange}
					search={search}
					onSearchChange={handleSearchChange}
					columnFilters={columnFilters}
					onColumnFiltersChange={handleColumnFiltersChange}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					selectMode={bulkSelectMode}
					pagination={{
						pageIndex: page - 1,
						pageSize,
						pageCount: result?.pagination.totalPages ?? 0,
						totalCount: result?.pagination.totalCount ?? 0,
						onPageChange: (pageIndex) => setPage(pageIndex + 1),
						onPageSizeChange: handlePageSizeChange,
					}}
				/>
			)}
		</div>
	);
}
