"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventTicketsPaged } from "@/lib/api/ticket";

const PAGE_SIZE = 50;

/** One group's paid tickets, newest page last, loaded 50 at a time. */
export function GroupTicketColumn({
	eventId,
	groupKey,
	title,
	typeCounts,
	typeNames,
}: {
	eventId: string;
	/** A ticket group id, or "none" for tickets without a group. */
	groupKey: string;
	title: string;
	/** ticket_type_id -> tickets of that type in the whole group. */
	typeCounts: Record<string, number>;
	typeNames: Record<string, string>;
}) {
	// Starts with "ticket-groups" so assigning or moving tickets refreshes it.
	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["ticket-groups", eventId, "tickets", groupKey],
			queryFn: ({ pageParam }) =>
				getEventTicketsPaged(eventId, {
					page: pageParam,
					perPage: PAGE_SIZE,
					ticketGroupId: groupKey,
					sortBy: "name",
					sortDir: "asc",
				}),
			initialPageParam: 1,
			getNextPageParam: (last) =>
				last.pagination.currentPage < last.pagination.totalPages
					? last.pagination.currentPage + 1
					: undefined,
		});

	const rows = data?.pages.flatMap((p) => p.data) ?? [];
	const total = data?.pages[0]?.pagination.totalCount ?? 0;

	return (
		<div className="flex min-w-0 flex-col border">
			<div className="flex items-center justify-between gap-2 border-b p-3">
				<span className="truncate font-medium text-sm">{title}</span>
				<Badge variant="secondary" className="shrink-0 tabular-nums">
					{total}
				</Badge>
			</div>
			<div className="space-y-1 border-b bg-muted/60 p-3 text-xs">
				{Object.entries(typeCounts).length === 0 ? (
					<span className="text-muted-foreground">No tickets</span>
				) : (
					Object.entries(typeCounts)
						.sort(([, a], [, b]) => b - a)
						.map(([id, n]) => (
							<div
								key={id}
								className="flex items-baseline justify-between gap-2"
							>
								<span className="truncate text-muted-foreground">
									{typeNames[id] ?? `#${id}`}
								</span>
								<span className="shrink-0 font-medium tabular-nums">{n}</span>
							</div>
						))
				)}
			</div>
			<div className="max-h-[28rem] divide-y overflow-y-auto">
				{isLoading ? (
					<p className="p-3 text-muted-foreground text-sm">Loading...</p>
				) : rows.length === 0 ? (
					<p className="p-3 text-muted-foreground text-sm">No tickets.</p>
				) : (
					rows.map((t) => (
						<div key={t.publicId} className="px-3 py-2">
							<p className="truncate font-medium text-sm">{t.name}</p>
							<p className="truncate text-muted-foreground text-xs">
								{t.ticketTypeName?.trim() || "-"}
							</p>
						</div>
					))
				)}
				{hasNextPage && (
					<div className="p-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full rounded-none"
							disabled={isFetchingNextPage}
							onClick={() => fetchNextPage()}
						>
							{isFetchingNextPage
								? "Loading..."
								: `Load more (${total - rows.length} left)`}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
