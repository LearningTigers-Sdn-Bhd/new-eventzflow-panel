"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { use, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { JsonSampleTool } from "@/components/json-sample-tool";
import { DataTable } from "@/components/pages/tickets/event-ticket-table";
import { TicketPageButton } from "@/components/pages/tickets/page-action/create-event-ticket-button";
import { ImportTicketButton } from "@/components/pages/tickets/page-action/import-ticket";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventTicketsPaged } from "@/lib/api/ticket";

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
	const [ticketFilter, setTicketFilter] = useState<TicketFilter>("active");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = usePersistedState(
		`event-${event_id}-tickets-page-size`,
		DEFAULT_PAGE_SIZE,
	);
	const [search, setSearch] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);

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
	const sortBy = sort?.id as
		| "name"
		| "email"
		| "status"
		| "createdAt"
		| undefined;
	const sortDir = sort ? (sort.desc ? "desc" : "asc") : undefined;

	const statusFilter = findColumnFilterValue(columnFilters, "status") as
		| string
		| undefined;
	const ticketTypeFilter = findColumnFilterValue(
		columnFilters,
		"ticketTypeName",
	) as string[] | undefined;

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<JsonSampleTool
					resourceName="Ticket"
					eventId={event_id}
					baseFields={TICKET_BASE_FIELDS}
				/>
				<ImportTicketButton />
				<TicketPageButton />
			</div>
		),
		[event_id],
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
				sortBy,
				sortDir,
			}),
		placeholderData: (previous) => previous,
	});

	return (
		<div className="space-y-4">
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
