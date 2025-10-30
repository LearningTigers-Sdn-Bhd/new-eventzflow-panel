"use client";

import { Calendar, Clock, Mail, Phone } from "lucide-react";
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
import { TicketActionsMenu } from "./action-menu";
import type { BaseTicket } from "./columns";

interface TicketItemProps {
	ticket: BaseTicket;
}

export function TicketItem({ ticket }: TicketItemProps) {
	const date = new Date(ticket.createdAt);

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between">
					<h3 className="truncate font-bold text-xl">{ticket.name}</h3>
					<Badge
						variant={ticket.status === "scanned" ? "default" : "secondary"}
						className={
							ticket.status === "scanned"
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100"
						}
					>
						{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex-1">
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
						RM{(typeof ticket.value === "number" ? ticket.value : parseFloat(ticket.value as string) || 0).toFixed(2)}
						{ticket.ticketTypeName && (
							<span className="ml-2 text-muted-foreground">
								({ticket.ticketTypeName})
							</span>
						)}
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
				<ItemActions>
					<TicketActionsMenu ticket={ticket} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
