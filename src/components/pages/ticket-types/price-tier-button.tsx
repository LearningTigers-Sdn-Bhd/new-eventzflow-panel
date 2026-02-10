"use client";

import { Banknote } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { TicketType } from "@/lib/api/ticket-type";
import { PriceTierDialog } from "./price-tier-dialog";

interface PriceTierButtonProps {
	ticketType: TicketType;
}

export function PriceTierButton({ ticketType }: PriceTierButtonProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog } = useDialog();

	const handleClick = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				ticketType,
				eventId,
			},
			config: {
				title: `Price Tiers: ${ticketType.name}`,
				description: "Configure time-based pricing tiers for this ticket type",
				size: "xl",
				className: "rounded-none",
			},
		});
	};

	return (
		<Button
			variant="outline"
			size="sm"
			className="gap-1.5 rounded-none"
			onClick={handleClick}
		>
			<Banknote className="h-3.5 w-3.5" />
			Adjust Price
		</Button>
	);
}
