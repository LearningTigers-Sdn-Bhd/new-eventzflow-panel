import type { Wish } from "../../../lib/api/wishes";

export function mergeIncomingWish(current: Wish[], incoming: Wish): Wish[] {
	const next = [incoming, ...current.filter((wish) => wish.id !== incoming.id)];
	return next.slice(0, 6);
}
