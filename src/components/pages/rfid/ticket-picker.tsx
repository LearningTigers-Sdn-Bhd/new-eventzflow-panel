"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { getEventTicketsPaged } from "@/lib/api/ticket/endpoints";

export type PickedTicket = { publicId: string; name: string };

/** Paid-ticket search (server side, 10 at a time) for a binding's ticket. */
export function TicketPicker({
	eventId,
	value,
	onSelect,
}: {
	eventId: string;
	value: PickedTicket | null;
	onSelect: (ticket: PickedTicket) => void;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const debounced = useDebounce(search.trim(), 300);

	const { data, isFetching } = useQuery({
		queryKey: ["event", eventId, "rfid", "ticket-picker", debounced],
		queryFn: () =>
			getEventTicketsPaged(eventId, { page: 1, perPage: 10, q: debounced }),
		enabled: open && debounced.length >= 2,
	});

	return (
		// modal: inside a Dialog the portaled list sits outside the dialog's scroll
		// lock, so the wheel never reaches it unless the popover is modal too.
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between rounded-none"
				>
					<span className="truncate">
						{value?.name ?? "Select a ticket..."}
					</span>
					<Search className="ml-2 size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) rounded-none p-0"
				align="start"
			>
				<Input
					className="rounded-none border-0 border-b focus-visible:ring-0"
					placeholder="Search name, email or phone..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				<div className="max-h-64 overflow-y-auto p-1">
					{debounced.length < 2 && (
						<p className="py-4 text-center text-muted-foreground text-sm">
							Type at least 2 characters.
						</p>
					)}
					{isFetching && (
						<div className="flex justify-center py-4">
							<Loader2 className="size-4 animate-spin" />
						</div>
					)}
					{!isFetching && debounced.length >= 2 && data?.data.length === 0 && (
						<p className="py-4 text-center text-muted-foreground text-sm">
							No paid ticket found.
						</p>
					)}
					{data?.data.map((ticket) => (
						<button
							type="button"
							key={ticket.publicId}
							className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted"
							onClick={() => {
								onSelect({ publicId: ticket.publicId, name: ticket.name });
								setOpen(false);
							}}
						>
							<span className="font-medium text-sm">{ticket.name}</span>
							<span className="text-muted-foreground text-xs">
								{ticket.email} · {ticket.ticketTypeName}
							</span>
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
