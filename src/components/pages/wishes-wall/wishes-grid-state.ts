import type { Wish } from "../../../lib/api/wishes";

export const WISHES_PER_PAGE = 8;

export function mergeIncomingWish(current: Wish[], incoming: Wish): Wish[] {
	return [incoming, ...current.filter((wish) => wish.id !== incoming.id)];
}

export function getRotationPageCount(wishes: ArrayLike<unknown>) {
	return Math.max(1, Math.ceil(wishes.length / WISHES_PER_PAGE));
}

export function normalizeRotationPage(
	page: number,
	wishes: ArrayLike<unknown>,
) {
	return page % getRotationPageCount(wishes);
}

export function getVisibleWishes(wishes: Wish[], page: number) {
	const currentPage = normalizeRotationPage(page, wishes);
	const start = currentPage * WISHES_PER_PAGE;
	return wishes.slice(start, start + WISHES_PER_PAGE);
}
