import { describe, expect, test } from "bun:test";
import type { HeadcountHall } from "@/lib/api/event/hall";
import { entryShares } from "./visitors";

const hall = (id: number, inEvent: number | null): HeadcountHall => ({
	id,
	name: `Hall ${id}`,
	floor: null,
	status: "ok",
	insideNow: 0,
	capacity: null,
	inToday: 0,
	outToday: 0,
	inEvent,
	outEvent: 0,
});

describe("entryShares", () => {
	test("splits whole-event entries by hall", () => {
		const shares = entryShares([hall(1, 75), hall(2, 25)]);
		expect(shares.get(1)).toBe(75);
		expect(shares.get(2)).toBe(25);
	});

	test("is null when nothing is counted or a hall has no figure", () => {
		expect(entryShares([hall(1, 0)]).get(1)).toBeNull();
		expect(entryShares([hall(1, null), hall(2, 10)]).get(1)).toBeNull();
	});
});
