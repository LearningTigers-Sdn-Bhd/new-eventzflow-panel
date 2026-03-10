"use client";

import { useQuery } from "@tanstack/react-query";
import { getTicketTypePriceTiers } from "@/lib/api/ticket-type-price-tier";

interface ActivePriceTierPriceProps {
	ticketTypeId: number;
	basePrice: number;
}

export function ActivePriceTierPrice({
	ticketTypeId,
	basePrice,
}: ActivePriceTierPriceProps) {
	const { data: priceTiers = [] } = useQuery({
		queryKey: ["ticket-type-price-tiers", ticketTypeId],
		queryFn: () => getTicketTypePriceTiers(ticketTypeId),
	});

	const activeTier = priceTiers.find((tier) => tier.active);

	if (activeTier) {
		return (
			<>
				<span className="text-muted-foreground text-sm line-through">
					RM{basePrice.toFixed(2)}
				</span>
				<span className="ml-1 font-medium text-green-600">
					RM{activeTier.price.toFixed(2)}
				</span>
			</>
		);
	}

	return <span>RM{basePrice.toFixed(2)}</span>;
}
