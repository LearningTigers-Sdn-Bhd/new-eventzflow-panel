import type { GiftPick } from "@/lib/api/lucky-draw/response";
import type { Gift } from "@/stores/lucky-draw-store";

/**
 * Pure helpers for a multi-winner draw (one click picks several winners).
 * Kept free of React so the rules are unit-tested.
 */

/** Picks `count` distinct items at random (partial Fisher-Yates). */
export function pickRandomWinners<T>(
	pool: readonly T[],
	count: number,
	random: () => number = Math.random,
): T[] {
	const items = [...pool];
	const take = Math.max(0, Math.min(count, items.length));
	for (let i = 0; i < take; i++) {
		const j = i + Math.floor(random() * (items.length - i));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items.slice(0, take);
}

/** Columns for the winners grid so 25 reads as 5x5 on the big screen. */
export function gridColumns(count: number): number {
	if (count <= 4) return Math.max(1, count);
	if (count <= 6) return 3;
	if (count <= 12) return 4;
	if (count <= 30) return 5;
	if (count <= 48) return 6;
	if (count <= 80) return 8;
	return 10;
}

/**
 * How many winners the next click may draw: the configured amount, capped by
 * the people left in the pool and, when gifts are on, by the open slots on the
 * gift being drawn for.
 */
export function getBatchSize({
	winnersPerDraw,
	available,
	giftSlotsLeft,
}: {
	winnersPerDraw: number;
	available: number;
	/** null when gifts are off (no per-gift cap) */
	giftSlotsLeft: number | null;
}): number {
	const caps = [winnersPerDraw, available];
	if (giftSlotsLeft !== null) caps.push(giftSlotsLeft);
	return Math.max(0, Math.min(...caps));
}

/**
 * Small seeded random generator (mulberry32). The same seed always gives the
 * same picks, so the "next gift" stays steady across renders and only changes
 * when the seed does.
 */
export function seededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Winners the gift can still take. */
export function giftSlotsLeft(gift: Gift): number {
	return gift.winner_counts - (gift.actual_winner_count ?? 0);
}

/** Gifts in draw order: the gift with order 1 first, then ascending order. */
function sortByGiftOrder(gifts: Gift[]): Gift[] {
	return [...gifts].sort(
		(a, b) =>
			Number(a.order !== 1) - Number(b.order !== 1) || a.order - b.order,
	);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/**
 * Gifts the next draw may use: the ones with open slots. In random mode a
 * draw-last gift (the grand prize) waits until nothing else is open.
 */
export function candidateGifts(gifts: Gift[], giftPick: GiftPick): Gift[] {
	const open = gifts.filter((gift) => giftSlotsLeft(gift) > 0);
	if (giftPick !== "random") return open;
	const regular = open.filter((gift) => !gift.draw_last);
	return regular.length > 0 ? regular : open;
}

export interface GiftPlan {
	/** Gift shown as the next one (null when nothing is open) */
	gift: Gift | null;
	/** One gift per winner of the next click, in draw order */
	targets: Gift[];
}

/**
 * Decides which gift each winner of the next click goes to.
 * - Gift by gift (default): the whole click fills one gift, picked by order or at random.
 * - Round sweep: one winner for every open gift, paired in order or shuffled.
 */
export function planGiftTargets({
	gifts,
	giftPick,
	roundSweep,
	winnersPerDraw,
	available,
	random,
}: {
	gifts: Gift[];
	giftPick: GiftPick;
	roundSweep: boolean;
	winnersPerDraw: number;
	available: number;
	random: () => number;
}): GiftPlan {
	const pool = candidateGifts(gifts, giftPick);
	if (pool.length === 0) return { gift: null, targets: [] };

	if (roundSweep) {
		const list =
			giftPick === "random" ? shuffle(pool, random) : sortByGiftOrder(pool);
		return { gift: list[0], targets: list.slice(0, Math.max(0, available)) };
	}

	const gift =
		giftPick === "random"
			? pool[Math.floor(random() * pool.length)]
			: sortByGiftOrder(pool)[0];
	const count = getBatchSize({
		winnersPerDraw,
		available,
		giftSlotsLeft: giftSlotsLeft(gift),
	});
	return { gift, targets: Array.from({ length: count }, () => gift) };
}
