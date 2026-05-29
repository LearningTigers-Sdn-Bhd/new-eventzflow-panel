"use client";

import { Banknote } from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialog } from "@/hooks/use-dialog";
import type { TicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { TicketTypeActionsMenu } from "./action-menu";
import { ActivePriceTierBadge } from "./active-price-tier-badge";
import { ActivePriceTierPrice } from "./active-price-tier-price";
import { PriceTierDialog } from "./price-tier-dialog";

interface TicketTypeItemProps {
	ticketType: TicketType;
}

export function TicketTypeItem({ ticketType }: TicketTypeItemProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog } = useDialog();

	const handleAdjustPrice = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				ticketType,
				eventId,
			},
			config: {
				title: `Price Tiers: ${ticketType.name}`,
				description: "Configure time-based pricing tiers for this ticket type",
				size: "3xl",
				className: "rounded-none",
			},
		});
	};

	return (
		<Card className="rounded-none border-dashed">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="font-medium text-base">
					{ticketType.name}{" "}
					<span className="text-muted-foreground text-xs font-normal">
						(#{ticketType.id})
					</span>
				</CardTitle>
				<TicketTypeActionsMenu ticketType={ticketType} />
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="space-y-1">
					<div className="font-medium">
						<ActivePriceTierPrice
							ticketTypeId={ticketType.id}
							basePrice={ticketType.price}
						/>
					</div>
					<ActivePriceTierBadge ticketTypeId={ticketType.id} />
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
				<Button
					variant="outline"
					size="sm"
					className="mt-2 w-full gap-1.5 rounded-none"
					onClick={handleAdjustPrice}
				>
					<Banknote className="h-3.5 w-3.5" />
					Adjust Price
				</Button>
			</CardContent>
		</Card>
	);
}
