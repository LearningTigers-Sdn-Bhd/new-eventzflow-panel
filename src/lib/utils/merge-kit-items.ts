/**
 * Utilities for merging exhibitor kit items and printing services
 * by their respective IDs and summing quantities.
 */

/**
 * Merges exhibitor kit items with the same rentable_item_id,
 * summing their quantities.
 */
export function mergeKitItems<
	T extends { rentable_item_id: number; quantity: number },
>(items: T[]): T[] {
	return items.reduce((acc, item) => {
		const existingItem = acc.find(
			(i) => i.rentable_item_id === item.rentable_item_id,
		);
		if (existingItem) {
			existingItem.quantity += item.quantity;
		} else {
			acc.push({ ...item });
		}
		return acc;
	}, [] as T[]);
}

/**
 * Merges exhibitor kit printings with the same printing_service_id,
 * summing their quantities.
 */
export function mergeKitPrintings<
	T extends { printing_service_id: number; quantity: number },
>(printings: T[]): T[] {
	return printings.reduce((acc, printing) => {
		const existingPrinting = acc.find(
			(p) => p.printing_service_id === printing.printing_service_id,
		);
		if (existingPrinting) {
			existingPrinting.quantity += printing.quantity;
		} else {
			acc.push({ ...printing });
		}
		return acc;
	}, [] as T[]);
}
