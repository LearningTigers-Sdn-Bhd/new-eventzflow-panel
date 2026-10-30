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
	dayBars,
	dayOverlay,
	dayRows,
	hallRows,
	hallTotalRows,
	headlineFigures,
	levelRows,
	soFarSeries,
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
				halls: [],
			},
			{
				date: "2026-10-31",
				entries: 0,
				exits: 0,
				peak: null,
				busiestEntryHour: null,
				closing: null,
				halls: [],
			},
		];
		expect(dayRows(days)).toEqual([
			["30 Oct", "30", "30", "30", "25 at 09:00", "09:00–10:00"],
			["31 Oct", "0", "30", "0", "—", "—"],
		]);
	});
});

describe("visitors so far", () => {
	test("the headline figure is absent on the first day", () => {
		expect(headlineFigures(trends, headcount).soFar).toBeNull();
	});

	test("on a later day it adds what came in on the days before", () => {
		const later: HeadcountTrends = {
			...trends,
			date: "2026-10-31",
			days: ["2026-10-30", "2026-10-31"],
			event: { points, stats, beforeIn: 100 },
		};
		expect(headlineFigures(later, headcount)).toMatchObject({
			soFar: 130,
			since: "30 Oct",
		});
	});

	test("the chart line starts from the earlier days' total", () => {
		expect(soFarSeries(points, 100)).toEqual([
			{ date: "2026-10-30 09:00", value: 130 },
			{ date: "2026-10-30 10:00", value: 130 },
		]);
	});
});

describe("dayOverlay", () => {
	const at = (date: string, time: string, entries: number) =>
		({
			time: `${date}T${time}:00`,
			entries,
			exits: 0,
			occupancy: entries * 2,
		}) as TrendPoint;
	const hourly = [
		{
			date: "2026-10-29",
			points: [at("2026-10-29", "09:00", 10), at("2026-10-29", "10:00", 20)],
		},
		{ date: "2026-10-30", points: [at("2026-10-30", "09:00", 5)] },
	];

	test("lines up the days on one time-of-day axis, leaving a gap where a day has no count yet", () => {
		const chart = dayOverlay(hourly, "entries");
		expect(chart.labels).toEqual(["09:00", "10:00"]);
		expect(chart.series.map((s) => [s.name, s.values])).toEqual([
			["29 Oct", [10, 20]],
			["30 Oct", [5, null]],
		]);
	});

	test("follows the clock choice and the measure", () => {
		const chart = dayOverlay(hourly, "occupancy", true);
		expect(chart.labels).toEqual(["9:00 AM", "10:00 AM"]);
		expect(chart.series[0].values).toEqual([20, 40]);
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

describe("12-hour reports and visitor totals", () => {
	const day: DaySummary = {
		date: "2026-10-30",
		entries: 30,
		exits: 30,
		peak: { occupancy: 25, at: "2026-10-30T14:15:00" },
		busiestEntryHour: { entries: 30, at: "2026-10-30T13:00:00" },
		closing: 0,
		halls: [],
	};

	test("day rows and headline times follow the clock choice", () => {
		expect(dayRows([day], true)[0]).toEqual([
			"30 Oct",
			"30",
			"30",
			"30",
			"25 at 2:15 PM",
			"1:00–2:00 PM",
		]);
		expect(dayRows([day])[0][4]).toBe("25 at 14:15");
	});

	test("bars are visitors per day", () => {
		expect(dayBars([day])).toEqual([{ period: "30 Oct", value: 30 }]);
	});

	test("hall totals split whole-event visitors by share", () => {
		const hall = (id: number, inEvent: number | null) => ({
			id,
			name: `Hall ${id}`,
			floor: null,
			status: "ok" as const,
			insideNow: 0,
			capacity: null,
			inToday: 0,
			outToday: 0,
			inEvent,
			outEvent: 0,
		});
		const counts = {
			halls: [hall(1, 75), hall(2, 25), hall(3, null)],
		} as Headcount;
		expect(hallTotalRows(counts)).toEqual([
			["Hall 1", "No level set", "75", "75%"],
			["Hall 2", "No level set", "25", "25%"],
			["Hall 3", "No level set", "—", "—"],
		]);
	});
});
