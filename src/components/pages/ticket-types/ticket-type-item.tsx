"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { TicketTypeActionsMenu } from "./action-menu";

interface TicketTypeItemProps {
	ticketType: TicketType;
}

export function TicketTypeItem({ ticketType }: TicketTypeItemProps) {
	return (
		<Card className="rounded-none border-dashed">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-base font-medium">{ticketType.name}</CardTitle>
				<TicketTypeActionsMenu ticketType={ticketType} />
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Price</span>
					<span className="font-medium">${ticketType.price.toFixed(2)}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Quantity</span>
					<span>{ticketType.quantity}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Max/Order</span>
					<span>{ticketType.maxPerOrder}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Status</span>
					<Badge
						className={cn(
							"rounded-none font-bold capitalize",
							ticketType.status === "published" && "bg-green-500",
							ticketType.status === "draft" && "bg-yellow-500",
							ticketType.status === "archived" && "bg-gray-500",
						)}
					>
						{ticketType.status}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
