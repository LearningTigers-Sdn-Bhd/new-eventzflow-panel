import type { GiftPick } from "@/lib/api/lucky-draw/response";

/**
 * Plain-English line saying what one click of Draw does with gifts on, so the
 * settings never have to be decoded. Shown live in the Draw Settings sheet.
 */
export function describeDraw({
	winnersPerDraw,
	giftPick,
	roundSweep,
}: {
	winnersPerDraw: number;
	giftPick: GiftPick;
	roundSweep: boolean;
}): string {
	if (roundSweep) {
		return giftPick === "random"
			? "Each click draws one winner for every gift that still has a slot, in a random order, so winners and prizes are paired at random. That is one round. Gifts marked Draw last join only after every other gift is full."
			: "Each click draws one winner for every gift that still has a slot, top of the gift list first (the first winner gets the first gift). That is one round.";
	}

	const winners =
		winnersPerDraw === 1 ? "1 winner" : `up to ${winnersPerDraw} winners`;
	return giftPick === "random"
		? `Each click draws ${winners} for one random gift that still has a slot. Gifts marked Draw last wait until the rest are full.`
		: `Each click draws ${winners} for the first gift in the list that still has a slot, then moves on to the next gift.`;
}
