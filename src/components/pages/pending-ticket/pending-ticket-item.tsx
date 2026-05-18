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
import { getPaymentStatusColor, getPaymentStatusText } from "./constants";
import {
	PendingTicketActionsMenu,
	usePendingTicketActions,
} from "./pending-ticket-action-menu";
import type { PendingTicket } from "./pending-ticket-table-columns";

interface PendingTicketItemProps {
	ticket: PendingTicket;
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

/**
 * Mobile/Tablet view component for displaying a pending ticket card
 */
export function PendingTicketItem({ ticket }: PendingTicketItemProps) {
	const isPaid =
		ticket.paymentStatus === "paid" || ticket.paymentStatus === "completed";
	const { openViewModal } = usePendingTicketActions({ ticket });

	return (
		<Item
			variant="default"
			className="h-auto w-full flex-col items-stretch border-none px-3 py-3 transition-colors hover:bg-muted/30"
		>
			<div className="flex w-full items-start gap-2">
				<ItemMedia variant="image" className="mt-0.5 size-9 shrink-0">
					<Avatar className="size-9 rounded-none border shadow-sm">
						<AvatarFallback
							className={cn(
								"rounded-none font-bold text-xs",
								isPaid
									? "bg-green-100 text-green-700"
									: "bg-amber-100 text-amber-700",
							)}
						>
							{getInitials(ticket.name)}
						</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent className="ml-2.5 min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<ItemTitle
								className="line-clamp-2 cursor-pointer break-words font-bold text-[15px] leading-tight transition-colors hover:text-primary"
								onClick={openViewModal}
							>
								{ticket.name}
							</ItemTitle>
						</div>
						<div className="shrink-0 self-start pt-0.5">
							<Badge
								variant="outline"
								className={cn(
									"h-6 gap-1 rounded-none px-2 font-bold text-[10px] uppercase",
									getPaymentStatusColor(ticket.paymentStatus),
								)}
							>
								{isPaid ? (
									<CheckCircle2 className="size-3" />
								) : (
									<Clock className="size-3" />
								)}
								{getPaymentStatusText(ticket.paymentStatus)}
							</Badge>
						</div>
					</div>
					<ItemDescription className="mt-1.5 flex flex-col gap-1">
						<span className="truncate font-mono text-[10px] text-muted-foreground">
							{ticket.publicId}
						</span>
						<div className="flex items-start justify-between gap-2">
							<div className="flex min-w-0 flex-1 items-start gap-1.5 pr-2">
								<Ticket className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
								<span className="line-clamp-2 break-words font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									{ticket.ticketTypeName || "General Admission"}
								</span>
							</div>
							<ItemActions className="shrink-0">
								<PendingTicketActionsMenu ticket={ticket} />
							</ItemActions>
						</div>
					</ItemDescription>
				</ItemContent>
			</div>
		</Item>
	);
}
