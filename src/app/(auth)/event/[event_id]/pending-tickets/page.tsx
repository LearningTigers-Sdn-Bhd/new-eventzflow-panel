"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { use, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PendingTicketPageButton } from "@/components/pages/pending-ticket/page-action/create-pending-ticket-button";
import { DataTable } from "@/components/pages/pending-ticket/pending-ticket-table";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getPendingTicketsPaged } from "@/lib/api/event/pending";

const DEFAULT_PAGE_SIZE = 10;

// The "paymentStatus"/"reviewStatus"/"rsvpStatus"/"ticketTypeName" column
// filters carry a single-value string[] (see pending-ticket-table-control.tsx's
// setFilterValue calls) — same shape as event-ticket-table-control.tsx.
function findColumnFilterValue(
	columnFilters: ColumnFiltersState,
	id: string,
): unknown {
	return columnFilters.find((f) => f.id === id)?.value;
}

export default function PendingTicketsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<PendingTicketPageButton />);

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = usePersistedState(
		`event-${event_id}-pending-tickets-page-size`,
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

	const paymentStatusFilter = findColumnFilterValue(
		columnFilters,
		"paymentStatus",
	) as string[] | undefined;
	const reviewStatusFilter = findColumnFilterValue(
		columnFilters,
		"reviewStatus",
	) as string[] | undefined;
	const rsvpStatusFilter = findColumnFilterValue(columnFilters, "rsvpStatus") as
		| string[]
		| undefined;
	const ticketTypeFilter = findColumnFilterValue(
		columnFilters,
		"ticketTypeName",
	) as string[] | undefined;

	const {
		data: result,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: [
			"event",
			event_id,
			"pending-tickets",
			page,
			pageSize,
			debouncedSearch,
			paymentStatusFilter,
			reviewStatusFilter,
			rsvpStatusFilter,
			ticketTypeFilter,
			sortBy,
			sortDir,
		],
		queryFn: () =>
			getPendingTicketsPaged(event_id, {
				page,
				perPage: pageSize,
				q: debouncedSearch || undefined,
				paymentStatus: paymentStatusFilter?.[0] as
					| "pending"
					| "failed"
					| "refunded_payment"
					| undefined,
				reviewStatus: reviewStatusFilter?.[0] as
					| "pending_review"
					| "approved"
					| "rejected"
					| undefined,
				rsvpStatus: rsvpStatusFilter?.[0] as
					| "not_sent"
					| "sent"
					| "confirmed"
					| "declined"
					| "expired"
					| undefined,
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
					title="Loading pending tickets..."
					description="Please wait while we fetch your pending tickets..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load pending tickets"
					description={
						error?.message ||
						"We couldn't load pending tickets. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<DataTable
					data={result?.data ?? []}
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
