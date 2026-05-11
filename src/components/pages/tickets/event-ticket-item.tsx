"use client";

import { CheckCircle2, Clock, Ticket } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { TicketActionsMenu, useTicketActions } from "./event-ticket-action-menu";
import type { BaseTicket } from "./event-ticket-table-columns";

interface TicketItemProps {
	ticket: BaseTicket;
	labelsData?: Record<string, string>;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function TicketItem({ ticket }: TicketItemProps) {
	const isScanned = ticket.status === "scanned";
	const { openViewModal } = useTicketActions({ ticket });

	return (
		<Item
			variant="default"
			className="h-auto w-full flex-col items-stretch border-none px-4 py-4 transition-colors hover:bg-muted/30"
		>
			<div className="flex w-full items-start">
				<ItemMedia variant="image" className="mt-0.5 size-10 shrink-0">
					<Avatar className="size-10 rounded-none border shadow-sm">
						<AvatarFallback
							className={cn(
								"rounded-none font-bold text-xs",
								isScanned
									? "bg-green-100 text-green-700"
									: "bg-blue-100 text-blue-700",
							)}
						>
							{getInitials(ticket.name)}
						</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent className="ml-3 flex-1 min-w-0">
					<ItemTitle
						className="cursor-pointer text-wrap break-words font-bold text-base leading-tight transition-colors hover:text-primary"
						onClick={openViewModal}
					>
						{ticket.name}
					</ItemTitle>
					<ItemDescription className="mt-2 flex flex-col gap-1.5">
						<span className="font-mono text-[10px] text-muted-foreground truncate">
							{ticket.publicId}
						</span>
						<div className="flex items-start gap-1.5">
							<Ticket className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
							<span className="text-wrap break-words font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								{ticket.ticketTypeName || "General Admission"}
							</span>
						</div>
					</ItemDescription>
				</ItemContent>
			</div>

			<div className="mt-4 flex w-full items-center justify-between gap-2">
				<div className="flex-1">
					{isScanned ? (
						<Badge
							variant="outline"
							className="h-7 gap-1.5 rounded-none border-green-200 bg-green-50 px-2.5 font-bold text-[10px] text-green-700 uppercase"
						>
							<CheckCircle2 className="size-3.5" />
							Scanned
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="h-7 gap-1.5 rounded-none border-gray-200 bg-gray-50 px-2.5 font-bold text-[10px] text-gray-500 uppercase"
						>
							<Clock className="size-3.5" />
							Pending
						</Badge>
					)}
				</div>
				<ItemActions className="shrink-0">
					<TicketActionsMenu ticket={ticket} deletedAt={ticket.deletedAt} />
				</ItemActions>
			</div>
		</Item>
	);
}
