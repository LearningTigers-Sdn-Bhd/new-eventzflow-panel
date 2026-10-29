import type { HeadcountHall } from "@/lib/api/event/hall";

/** Each item's share of the total, as a whole percent. Null for an item with no figure, and for all of them while nothing is counted. */
export function sharesOf(
	items: { id: number; value: number | null }[],
): Map<number, number | null> {
	const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0);
	return new Map(
		items.map((item) => [
			item.id,
			total > 0 && item.value !== null
				? Math.round((item.value / total) * 100)
				: null,
		]),
	);
}

/** A hall's share of everyone counted coming in over the whole event. */
export function entryShares(
	halls: HeadcountHall[],
): Map<number, number | null> {
	return sharesOf(halls.map((h) => ({ id: h.id, value: h.inEvent })));
}
