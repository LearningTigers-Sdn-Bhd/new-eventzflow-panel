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
import {
	getPaymentStatusColor,
	getPaymentStatusText,
} from "./constants";
import { PendingTicketActionsMenu, usePendingTicketActions } from "./pending-ticket-action-menu";
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
export function PendingTicketItem({
	ticket,
}: PendingTicketItemProps) {
	const isPaid = ticket.paymentStatus === "paid" || ticket.paymentStatus === "approved";
	const { openViewModal } = usePendingTicketActions({ ticket });

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
								isPaid
									? "bg-green-100 text-green-700"
									: "bg-amber-100 text-amber-700",
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
					<Badge
						variant="outline"
						className={cn(
							"h-7 gap-1.5 rounded-none px-2.5 font-bold text-[10px] uppercase",
							getPaymentStatusColor(ticket.paymentStatus),
						)}
					>
						{isPaid ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
						{getPaymentStatusText(ticket.paymentStatus)}
					</Badge>
				</div>
				<ItemActions className="shrink-0">
					<PendingTicketActionsMenu ticket={ticket} />
				</ItemActions>
			</div>
		</Item>
	);
}
