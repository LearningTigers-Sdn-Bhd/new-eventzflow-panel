import { describe, expect, test } from "bun:test";
import type {
	DaySummary,
	Headcount,
	HeadcountTrends,
	TrendPoint,
} from "@/lib/api/event/hall";
import {
	capacityVerdict,
	chartSeries,
	dayRows,
	hallRows,
	headlineFigures,
	levelRows,
} from "./people-counter-rows";

const p = (time: string, entries: number, exits: number, occupancy: number) =>
	({ time: `2026-10-30T${time}:00`, entries, exits, occupancy }) as TrendPoint;

const points = [p("09:00", 30, 5, 25), p("10:00", 0, 25, 0)];
const stats = {
	peak: { occupancy: 25, at: "2026-10-30T09:00:00" },
	busiestEntryHour: { entries: 30, at: "2026-10-30T09:00:00" },
	recentFlow: null,
};

const trends: HeadcountTrends = {
	configured: true,
	date: "2026-10-30",
	days: ["2026-10-30"],
	bucket: 60,
	event: { points, stats },
	levels: [{ floor: "Level 1", points, stats }],
	halls: [
		{ id: 1, name: "Hall A", floor: "Level 1", status: "ok", points, stats },
		{
			id: 2,
			name: "Hall B",
			floor: null,
			status: "unlinked",
			points: [],
			stats: null,
		},
	],
	generatedAt: "",
};

const figures = {
	insideNow: 0,
	inToday: 0,
	outToday: 0,
	inEvent: 0,
	outEvent: 0,
};
const headcount = {
	configured: true,
	event: { ...figures, capacity: 100, halls: 2, hallsCounted: 1 },
	levels: [
		{ ...figures, floor: "Level 1", capacity: 27, halls: 1, hallsCounted: 1 },
	],
	halls: [
		{
			...figures,
			id: 1,
			name: "Hall A",
			floor: "Level 1",
			status: "ok",
			capacity: 27,
		},
		{
			...figures,
			id: 2,
			name: "Hall B",
			floor: null,
			status: "unlinked",
			capacity: null,
		},
	],
	generatedAt: "",
} as Headcount;

describe("capacityVerdict", () => {
	test("words for within, nearly full, over and unknown", () => {
		expect(capacityVerdict(50, 100)).toBe("Within capacity");
		expect(capacityVerdict(90, 100)).toBe("Nearly full");
		expect(capacityVerdict(101, 100)).toBe("Over capacity");
		expect(capacityVerdict(null, 100)).toBe("No capacity set");
		expect(capacityVerdict(10, null)).toBe("No capacity set");
	});
});

describe("headlineFigures", () => {
	test("sums the day and reads the peak and busiest hour", () => {
		expect(headlineFigures(trends, headcount)).toMatchObject({
			peak: 25,
			peakAt: "09:00",
			entries: 30,
			exits: 30,
			busiest: 30,
			busiestHour: "09:00–10:00",
			closing: 0,
			capacity: 100,
		});
	});
});

describe("levelRows and hallRows", () => {
	test("a level row carries capacity, peak, totals and the verdict", () => {
		expect(levelRows(trends, headcount)).toEqual([
			["Level 1", "27", "25", "09:00", "30", "30", "Nearly full"],
		]);
	});

	test("a hall without a counter shows why instead of a verdict", () => {
		const rows = hallRows(trends, headcount);
		expect(rows[0]).toEqual([
			"Hall A",
			"Level 1",
			"27",
			"25",
			"30",
			"30",
			"Nearly full",
		]);
		expect(rows[1]).toEqual([
			"Hall B",
			"No level set",
			"—",
			"—",
			"0",
			"0",
			"No counter linked yet",
		]);
	});
});

describe("dayRows", () => {
	test("one row per day, with dashes when nothing was counted", () => {
		const days: DaySummary[] = [
			{
				date: "2026-10-30",
				entries: 30,
				exits: 30,
				peak: { occupancy: 25, at: "2026-10-30T09:00:00" },
				busiestEntryHour: { entries: 30, at: "2026-10-30T09:00:00" },
				closing: 0,
			},
			{
				date: "2026-10-31",
				entries: 0,
				exits: 0,
				peak: null,
				busiestEntryHour: null,
				closing: null,
			},
		];
		expect(dayRows(days)).toEqual([
			["30 Oct", "30", "30", "25 at 09:00", "09:00–10:00", "0"],
			["31 Oct", "0", "0", "—", "—", "—"],
		]);
	});
});

describe("chartSeries", () => {
	test("turns counter times into the 'date hh:mm' the PDF charts read", () => {
		expect(chartSeries(points, "occupancy")).toEqual([
			{ date: "2026-10-30 09:00", value: 25 },
			{ date: "2026-10-30 10:00", value: 0 },
		]);
	});
});
