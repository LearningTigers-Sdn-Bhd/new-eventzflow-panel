"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEventTicketsPaged } from "@/lib/api/ticket";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

export type MoveTarget = { key: string; name: string };

/** "Move to" choices: every group except the one the ticket is already in. */
export function MoveToItems({
	targets,
	currentKey,
	onPick,
}: {
	targets: MoveTarget[];
	currentKey?: string;
	onPick: (key: string) => void;
}) {
	return (
		<>
			<DropdownMenuLabel>Move to</DropdownMenuLabel>
			{targets
				.filter((t) => t.key !== currentKey)
				.map((t) => (
					<DropdownMenuItem key={t.key} onClick={() => onPick(t.key)}>
						{t.name}
					</DropdownMenuItem>
				))}
		</>
	);
}

function TicketRow({
	groupKey,
	name,
	typeName,
	publicId,
	selected,
	onToggle,
	targets,
	onMove,
}: {
	groupKey: string;
	name: string;
	typeName: string;
	publicId: string;
	selected: boolean;
	onToggle: () => void;
	targets: MoveTarget[];
	onMove: (key: string) => void;
}) {
	const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
		id: publicId,
		data: { publicId, groupKey, name, typeName },
	});

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				"flex cursor-grab touch-pan-y items-center gap-2 px-3 py-2",
				selected && "bg-muted/60",
				isDragging && "opacity-40",
			)}
		>
			<Checkbox
				checked={selected}
				onCheckedChange={onToggle}
				aria-label={`Select ${name}`}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm">{name}</p>
				<p className="truncate text-muted-foreground text-xs">{typeName}</p>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8 shrink-0 rounded-none"
						aria-label={`Move ${name}`}
					>
						<MoreVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<MoveToItems
						targets={targets}
						currentKey={groupKey}
						onPick={onMove}
					/>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

/** One group's paid tickets, newest page last, loaded 50 at a time. Also a drop target. */
export function GroupTicketColumn({
	eventId,
	groupKey,
	title,
	typeCounts,
	typeNames,
	targets,
	selected,
	onToggle,
	onMove,
}: {
	eventId: string;
	/** A ticket group id, or "none" for tickets without a group. */
	groupKey: string;
	title: string;
	/** ticket_type_id -> tickets of that type in the whole group. */
	typeCounts: Record<string, number>;
	typeNames: Record<string, string>;
	/** Every place a ticket can go: the groups, plus "none". */
	targets: MoveTarget[];
	selected: Set<string>;
	onToggle: (publicId: string) => void;
	/** Moves these tickets to the target key. */
	onMove: (publicIds: string[], targetKey: string) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: groupKey });
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
		<div
			ref={setNodeRef}
			className={cn(
				"flex min-w-0 flex-col border transition-colors",
				isOver && "border-primary bg-primary/5",
			)}
		>
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
					<p className="p-3 text-muted-foreground text-sm">
						No tickets. Drop one here.
					</p>
				) : (
					rows.map((t) => (
						<TicketRow
							key={t.publicId}
							groupKey={groupKey}
							publicId={t.publicId}
							name={t.name}
							typeName={t.ticketTypeName?.trim() || "-"}
							selected={selected.has(t.publicId)}
							onToggle={() => onToggle(t.publicId)}
							targets={targets}
							// The menu moves the whole selection when this ticket is part of it.
							onMove={(key) =>
								onMove(
									selected.has(t.publicId) ? [...selected] : [t.publicId],
									key,
								)
							}
						/>
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
