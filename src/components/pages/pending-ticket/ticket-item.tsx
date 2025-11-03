"use client";

import { Calendar, Clock, FileDigit, Mail, Phone } from "lucide-react";
import { HiCash } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { PendingTicketActionsMenu } from "./action-menu";
import type { PendingTicket } from "./columns";
import {
	formatTicketPrice,
	getPaymentStatusColor,
	getPaymentStatusText,
} from "./constants";

interface PendingTicketItemProps {
	ticket: PendingTicket;
}

/**
 * Mobile/Tablet view component for displaying a pending ticket card
 */
export function PendingTicketItem({ ticket }: PendingTicketItemProps) {
	const date = new Date(ticket.createdAt);

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between">
					<div className="flex flex-col justify-start gap-2">
						<h3 className="truncate font-bold text-xl">{ticket.name}</h3>
					</div>
				</ItemTitle>
				<ItemDescription className="flex w-full flex-col justify-start gap-2">
					<Badge
						variant="secondary"
						className={cn(
							"rounded-none",
							getPaymentStatusColor(ticket.paymentStatus),
						)}
					>
						{getPaymentStatusText(ticket.paymentStatus)}
					</Badge>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="flex-1">
				<div className="flex w-full items-center justify-start gap-2">
					<FileDigit className="size-4 text-muted-foreground" />
					<span className="truncate font-medium text-sm">
						{ticket.transactionId || "No transaction ID"}
					</span>
				</div>
				<div className="flex w-full items-center justify-start gap-2">
					<Mail className="size-4 text-muted-foreground" />
					<span className="truncate font-medium text-sm">{ticket.email}</span>
				</div>
				<div className="flex w-full items-center justify-start gap-2">
					<Phone className="size-4 text-muted-foreground" />
					<span className="truncate font-medium text-sm">{ticket.phone}</span>
				</div>
				<div className="flex w-full items-center justify-start gap-2">
					<HiCash className="-ml-0.5 size-5 text-muted-foreground" />
					<span className="truncate font-medium text-sm">
						{formatTicketPrice(ticket.value)}
					</span>
				</div>
				<div className="flex w-full max-w-1/2 flex-row items-center justify-between gap-2 md:max-w-none md:flex-col md:items-start md:justify-start">
					<div className="flex items-center justify-start gap-2">
						<Calendar className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{date.toLocaleDateString()}
						</span>
					</div>
					<div className="flex items-center justify-start gap-2">
						<Clock className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{date.toLocaleTimeString()}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemFooter className="flex w-full justify-end">
				<ItemActions className="flex w-full items-center justify-end gap-2">
					<PendingTicketActionsMenu ticket={ticket} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
