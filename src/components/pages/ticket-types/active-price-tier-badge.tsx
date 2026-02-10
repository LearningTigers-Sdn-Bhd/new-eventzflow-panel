"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { getTicketTypePriceTiers } from "@/lib/api/ticket-type-price-tier";

interface ActivePriceTierBadgeProps {
	ticketTypeId: number;
}

export function ActivePriceTierBadge({
	ticketTypeId,
}: ActivePriceTierBadgeProps) {
	const { data: priceTiers = [] } = useQuery({
		queryKey: ["ticket-type-price-tiers", ticketTypeId],
		queryFn: () => getTicketTypePriceTiers(ticketTypeId),
	});

	const activeTier = priceTiers.find((tier) => tier.active);

	if (!activeTier) {
		return null;
	}

	return (
		<div className="flex items-center gap-1.5 text-xs">
			<Badge variant="secondary" className="rounded-none px-1.5 py-0 text-xs">
				{activeTier.label}
			</Badge>
		</div>
	);
}
