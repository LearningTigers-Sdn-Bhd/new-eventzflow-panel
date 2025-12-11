import type { EventRentableItemPriceTier } from "@/lib/api/event-rentable-item";
import type { EventPrintingServicePriceTier } from "@/lib/api/event-printing-service";

/**
 * Calculate the current price for an item based on price tiers
 * Returns the price from the tier that matches the current date
 * Falls back to default price if no tier matches
 */
export function getCurrentPrice(
	priceTiers: EventRentableItemPriceTier[] | EventPrintingServicePriceTier[] | undefined,
	defaultPrice: number,
): number {
	if (!priceTiers || priceTiers.length === 0) {
		return defaultPrice;
	}

	const now = new Date();

	// Find the tier that matches current date
	const activeTier = priceTiers.find((tier) => {
		const startDate = new Date(tier.startDate);
		const endDate = tier.endDate ? new Date(tier.endDate) : null;

		const isAfterStart = now >= startDate;
		const isBeforeEnd = !endDate || now <= endDate;

		return isAfterStart && isBeforeEnd;
	});

	return activeTier ? activeTier.price : defaultPrice;
}

/**
 * Get the label of the current active price tier
 */
export function getCurrentPriceTierLabel(
	priceTiers: EventRentableItemPriceTier[] | EventPrintingServicePriceTier[] | undefined,
): string | null {
	if (!priceTiers || priceTiers.length === 0) {
		return null;
	}

	const now = new Date();

	const activeTier = priceTiers.find((tier) => {
		const startDate = new Date(tier.startDate);
		const endDate = tier.endDate ? new Date(tier.endDate) : null;

		const isAfterStart = now >= startDate;
		const isBeforeEnd = !endDate || now <= endDate;

		return isAfterStart && isBeforeEnd;
	});

	return activeTier?.label || null;
}
