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
import { cn } from "@/lib/utils";
import { TicketActionsMenu } from "./action-menu";
import type { BaseTicket } from "./columns";

interface TicketItemProps {
	ticket: BaseTicket;
	labelsData?: Record<string, string>;
}

export function TicketItem({ ticket, labelsData }: TicketItemProps) {
	const date = new Date(ticket.createdAt);
	const hasCustomLabels = labelsData && Object.keys(labelsData).length > 0;

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="flex min-h-12 w-full flex-col items-start justify-start">
					<h3 className="truncate text-wrap font-bold text-xl">
						{ticket.name}
					</h3>
					<Badge
						variant={ticket.status === "scanned" ? "default" : "secondary"}
						className={cn(
							"rounded-none",
							ticket.status === "scanned"
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						)}
					>
						{ticket.status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex flex-col gap-2">
				<div className="grid grid-cols-2 gap-2">
					<div className="flex w-full items-center justify-start gap-2">
						<Mail className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{ticket.email || "Not provided"}
						</span>
					</div>
					{ticket.phone && (
						<div className="flex w-full items-center justify-start gap-2">
							<Phone className="size-4 text-muted-foreground" />
							<span className="truncate font-medium text-sm">
								{ticket.phone || "Not provided"}
							</span>
						</div>
					)}
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
					<div className="col-span-2 flex w-full items-center justify-start gap-2">
						<HiCash className="-ml-0.5 size-5 text-muted-foreground" />
						<p className="truncate font-medium text-normal">
							<span>RM</span>
							{(typeof ticket.value === "number"
								? ticket.value
								: Number.parseFloat(ticket.value as string) || 0
							).toFixed(2)}
						</p>
						{ticket.ticketTypeName && (
							<p className="text-muted-foreground">({ticket.ticketTypeName})</p>
						)}
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
					<TicketActionsMenu ticket={ticket} deletedAt={ticket.deletedAt} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
