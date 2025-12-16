"use client";

import { Calendar, Clock, FileDigit, Mail, Phone } from "lucide-react";
import { HiCash } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import {
	formatTicketPrice,
	getPaymentStatusColor,
	getPaymentStatusText,
} from "./constants";
import { PendingTicketActionsMenu } from "./pending-ticket-action-menu";
import type { PendingTicket } from "./pending-ticket-table-columns";

interface PendingTicketItemProps {
	ticket: PendingTicket;
	labelsData?: Record<string, string>;
}

/**
 * Mobile/Tablet view component for displaying a pending ticket card
 */
export function PendingTicketItem({
	ticket,
	labelsData,
}: PendingTicketItemProps) {
	const date = new Date(ticket.createdAt);
	const hasCustomLabels = labelsData && Object.keys(labelsData).length > 0;

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between">
					<h3 className="truncate font-bold text-xl">{ticket.name}</h3>
					<Badge
						variant="secondary"
						className={cn(
							"rounded-none",
							getPaymentStatusColor(ticket.paymentStatus),
						)}
					>
						{getPaymentStatusText(ticket.paymentStatus)}
					</Badge>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex-1 space-y-3">
				<div className="flex w-full items-center justify-start gap-2">
					<Mail className="size-4 text-muted-foreground" />
					<span className="truncate font-medium text-sm">{ticket.email}</span>
				</div>
				{ticket.phone && (
					<div className="flex w-full items-center justify-start gap-2">
						<Phone className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">{ticket.phone}</span>
					</div>
				)}
				<div className="flex w-full items-center justify-start gap-2">
					<HiCash className="-ml-0.5 size-5 text-muted-foreground" />
					<span className="truncate font-medium text-sm">
						{formatTicketPrice(ticket.value)}
						{ticket.ticketTypeName && (
							<span className="ml-2 text-muted-foreground">
								({ticket.ticketTypeName})
							</span>
						)}
					</span>
				</div>
				{ticket.transactionId && (
					<div className="flex w-full items-center justify-start gap-2">
						<FileDigit className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{ticket.transactionId}
						</span>
					</div>
				)}
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

				{hasCustomLabels && (
					<div className="space-y-2 border-t pt-3">
						<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
							Additional Information
						</h4>
						<div className="grid grid-cols-1 gap-2">
							{Object.entries(labelsData).map(([key, labelName]) => {
								const value =
									ticket.customLabels?.find((l) => l.name === labelName)
										?.value || "";
								return (
									<div key={key} className="space-y-0.5">
										<p className="font-medium text-muted-foreground text-xs">
											{labelName}
										</p>
										<p
											className={cn(
												"font-medium text-sm",
												!value && "text-muted-foreground italic",
											)}
										>
											{value || "Not provided"}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</ItemContent>
			<ItemFooter className="flex w-full justify-end">
				<ItemActions>
					<PendingTicketActionsMenu ticket={ticket} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
