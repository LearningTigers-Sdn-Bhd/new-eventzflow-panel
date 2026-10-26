import { expect, test } from "bun:test";
import {
	candidateGifts,
	getBatchSize,
	gridColumns,
	pickRandomWinners,
	planGiftTargets,
	seededRandom,
} from "./batch-draw";
import {
	buildWinnerGroups,
	buildWinnersCsv,
	namesToText,
	sheetNames,
} from "./export-winners";

test("picks distinct winners and never more than the pool", () => {
	const pool = Array.from({ length: 30 }, (_, i) => i);
	const picked = pickRandomWinners(pool, 25);
	expect(picked).toHaveLength(25);
	expect(new Set(picked).size).toBe(25);
	expect(pickRandomWinners([1, 2], 5)).toHaveLength(2);
	expect(pickRandomWinners([1, 2, 3], 0)).toEqual([]);
	expect(pool).toHaveLength(30);
});

test("batch size is capped by pool and by open gift slots", () => {
	const base = { winnersPerDraw: 25, available: 100, giftSlotsLeft: null };
	expect(getBatchSize(base)).toBe(25);
	expect(getBatchSize({ ...base, available: 10 })).toBe(10);
	expect(getBatchSize({ ...base, giftSlotsLeft: 5 })).toBe(5);
	expect(getBatchSize({ ...base, giftSlotsLeft: 0 })).toBe(0);
});

test("25 winners lay out as a 5x5 grid", () => {
	expect(gridColumns(25)).toBe(5);
	expect(gridColumns(1)).toBe(1);
	expect(gridColumns(3)).toBe(3);
	expect(gridColumns(60)).toBe(8);
	expect(gridColumns(100)).toBe(10);
});

test("groups winners per gift in order, or one list without gifts", () => {
	const gift = (id: string, order: number, names: string[]) =>
		({
			id,
			name: `Round ${order}`,
			order,
			winner_counts: names.length,
			winner: null,
			allWinners: names.map((name, i) => ({
				id: i,
				name,
				type: "ticket" as const,
				publicId: String(i),
			})),
		}) as never;
	const groups = buildWinnerGroups(
		true,
		[gift("b", 2, ["C"]), gift("a", 1, ["A", "B"])],
		[],
	);
	expect(groups).toEqual([
		{ title: "Round 1", names: ["A", "B"] },
		{ title: "Round 2", names: ["C"] },
	]);
	const winner = (name: string, round: number | null) =>
		({ participant: { id: 1, name }, round }) as never;
	const plain = buildWinnerGroups(
		false,
		[],
		[winner("C", 2), winner("A", 1), winner("B", 1), winner("Old", null)],
	);
	expect(plain).toEqual([
		{ title: "Winners", names: ["Old"] },
		{ title: "Round 1", names: ["A", "B"] },
		{ title: "Round 2", names: ["C"] },
	]);
});

test("csv escapes quotes and neutralizes formulas", () => {
	const csv = buildWinnersCsv([{ title: "R1", names: ['A "B"', "=1+1"] }]);
	expect(csv).toContain('R1,1,"A ""B"""');
	expect(csv).toContain("R1,2,'=1+1");
	expect(namesToText(["A", "B"])).toBe("A\nB");
});

test("sheet names are valid and unique", () => {
	const names = sheetNames(["Round 1", "round 1", "A/B:C", "x".repeat(40)]);
	expect(names[0]).toBe("Round 1");
	expect(names[1]).toBe("round 1 (2)");
	expect(names[2]).toBe("A B C");
	expect(names[3]).toHaveLength(31);
});

// --- gift planning (which gift each winner of a click goes to) ---

const planGift = (
	name: string,
	order: number,
	winner_counts: number,
	opts: { won?: number; draw_last?: boolean } = {},
) =>
	({
		id: name,
		name,
		order,
		winner_counts,
		draw_last: opts.draw_last ?? false,
		actual_winner_count: opts.won ?? 0,
		winner: null,
	}) as never;

const planBase = {
	roundSweep: false,
	winnersPerDraw: 1,
	available: 100,
	random: seededRandom(1),
};
const names = (gifts: { name: string }[]) => gifts.map((g) => g.name);

test("in order: first open gift by order, ignoring draw-last", () => {
	const gifts = [
		planGift("C", 3, 1),
		planGift("Grand", 1, 1, { draw_last: true }),
		planGift("B", 2, 1),
	];
	const plan = planGiftTargets({ ...planBase, gifts, giftPick: "in_order" });
	expect(plan.gift?.name).toBe("Grand");

	const done = [planGift("A", 1, 1, { won: 1 }), planGift("B", 2, 1)];
	expect(
		planGiftTargets({ ...planBase, gifts: done, giftPick: "in_order" }).gift
			?.name,
	).toBe("B");
});

test("gift by gift: one click fills the same gift, capped by its open slots", () => {
	const gifts = [planGift("A", 1, 5, { won: 3 }), planGift("B", 2, 5)];
	const plan = planGiftTargets({
		...planBase,
		gifts,
		giftPick: "in_order",
		winnersPerDraw: 25,
	});
	expect(names(plan.targets)).toEqual(["A", "A"]);
});

test("random holds draw-last gifts until nothing else is open", () => {
	const gifts = [
		planGift("A", 1, 1),
		planGift("B", 2, 1),
		planGift("Grand", 3, 1, { draw_last: true }),
	];
	expect(names(candidateGifts(gifts, "random"))).toEqual(["A", "B"]);
	const left = [planGift("A", 1, 1, { won: 1 }), gifts[2]];
	expect(names(candidateGifts(left, "random"))).toEqual(["Grand"]);

	for (let seed = 0; seed < 20; seed++) {
		const plan = planGiftTargets({
			...planBase,
			gifts,
			giftPick: "random",
			random: seededRandom(seed),
		});
		expect(["A", "B"]).toContain(plan.gift?.name ?? "");
	}
});

test("random pick reaches every open gift and repeats for the same seed", () => {
	const gifts = [planGift("A", 1, 1), planGift("B", 2, 1), planGift("C", 3, 1)];
	const seen = new Set<string>();
	for (let seed = 0; seed < 60; seed++) {
		const plan = planGiftTargets({
			...planBase,
			gifts,
			giftPick: "random",
			random: seededRandom(seed),
		});
		seen.add(plan.gift?.name ?? "");
	}
	expect(seen.size).toBe(3);
	const again = () =>
		planGiftTargets({
			...planBase,
			gifts,
			giftPick: "random",
			random: seededRandom(7),
		}).gift?.name;
	expect(again()).toBe(again());
});

test("round sweep: one winner per open gift, in order", () => {
	const gifts = [
		planGift("B", 2, 2),
		planGift("A", 1, 2, { won: 1 }),
		planGift("Done", 3, 1, { won: 1 }),
	];
	const plan = planGiftTargets({
		...planBase,
		gifts,
		giftPick: "in_order",
		roundSweep: true,
		winnersPerDraw: 25,
	});
	expect(names(plan.targets)).toEqual(["A", "B"]);
});

test("round sweep with random shuffles the same gifts and holds draw-last", () => {
	const gifts = [
		planGift("A", 1, 1),
		planGift("B", 2, 1),
		planGift("C", 3, 1),
		planGift("Grand", 4, 1, { draw_last: true }),
	];
	const plan = planGiftTargets({
		...planBase,
		gifts,
		giftPick: "random",
		roundSweep: true,
		random: seededRandom(3),
	});
	expect(names(plan.targets).sort()).toEqual(["A", "B", "C"]);

	const last = planGiftTargets({
		...planBase,
		gifts: [planGift("Grand", 4, 1, { draw_last: true })],
		giftPick: "random",
		roundSweep: true,
	});
	expect(names(last.targets)).toEqual(["Grand"]);
});

test("round sweep never plans more winners than people left", () => {
	const gifts = [planGift("A", 1, 1), planGift("B", 2, 1), planGift("C", 3, 1)];
	const plan = planGiftTargets({
		...planBase,
		gifts,
		giftPick: "in_order",
		roundSweep: true,
		available: 2,
	});
	expect(names(plan.targets)).toEqual(["A", "B"]);
});

test("no open gift means no plan", () => {
	const plan = planGiftTargets({
		...planBase,
		gifts: [planGift("A", 1, 1, { won: 1 })],
		giftPick: "random",
	});
	expect(plan).toEqual({ gift: null, targets: [] });
});

test("gift winners from a sweep export per round with their gift", () => {
	const won = (name: string, round: number | null) => ({
		id: 1,
		name,
		type: "ticket",
		publicId: name,
		round,
	});
	const giftWith = (
		name: string,
		order: number,
		winners: ReturnType<typeof won>[],
	) => ({ id: name, name, order, allWinners: winners }) as never;

	const groups = buildWinnerGroups(
		true,
		[
			giftWith("Phone", 1, [won("Ann", 1), won("Cy", 2), won("Old", null)]),
			giftWith("Voucher", 2, [won("Bo", 1), won("Di", 2)]),
		],
		[],
	);
	expect(groups).toEqual([
		{ title: "Phone", names: ["Old"] },
		{ title: "Round 1", names: ["Ann", "Bo"], gifts: ["Phone", "Voucher"] },
		{ title: "Round 2", names: ["Cy", "Di"], gifts: ["Phone", "Voucher"] },
	]);

	const csv = buildWinnersCsv(groups);
	expect(csv).toContain("Round,No.,Name,Gift");
	expect(csv).toContain("Round 1,2,Bo,Voucher");
});
