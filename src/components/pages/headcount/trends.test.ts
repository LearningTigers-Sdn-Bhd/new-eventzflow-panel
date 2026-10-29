import { describe, expect, test } from "bun:test";
import type { HeadcountHall, HeadcountTrends } from "@/lib/api/event/hall";
import { capacityAlerts } from "./alerts";
import {
	compareRows,
	dayLabel,
	hourRange,
	scopeOptions,
	signed,
	timeLabel,
} from "./trend-format";

const hall = (over: Partial<HeadcountHall>): HeadcountHall => ({
	id: 1,
	name: "Hall A",
	floor: null,
	status: "ok",
	insideNow: 0,
	capacity: 100,
	inToday: 0,
	outToday: 0,
	inEvent: 0,
	outEvent: 0,
	...over,
});

describe("capacityAlerts", () => {
	test("flags near-full and over-capacity halls, worst first", () => {
		const alerts = capacityAlerts([
			hall({ id: 1, name: "Calm", insideNow: 50 }),
			hall({ id: 2, name: "Near", insideNow: 92 }),
			hall({ id: 3, name: "Over", insideNow: 120 }),
		]);
		expect(alerts.map((a) => [a.hallName, a.level, a.percent])).toEqual([
			["Over", "over", 120],
			["Near", "near", 92],
		]);
	});

	test("exactly 100% is still 'near', not over", () => {
		expect(capacityAlerts([hall({ insideNow: 100 })])[0].level).toBe("near");
	});

	test("skips halls without a figure, a capacity or a working counter", () => {
		expect(
			capacityAlerts([
				hall({ id: 1, insideNow: null }),
				hall({ id: 2, capacity: null, insideNow: 500 }),
				hall({ id: 3, status: "unavailable", insideNow: 500 }),
			]),
		).toEqual([]);
	});
});

describe("time labels", () => {
	test("slice the counter's clock without parsing it", () => {
		expect(timeLabel("2026-09-11T14:15:00")).toBe("14:15");
		expect(hourRange("2026-09-11T14:00:00")).toBe("14:00–15:00");
		expect(hourRange("2026-09-11T23:00:00")).toBe("23:00–00:00");
	});

	test("dayLabel formats a date-only string in local time", () => {
		expect(dayLabel("2026-09-11")).toBe("11 Sep 2026");
	});

	test("signed uses a plus and a real minus", () => {
		expect(signed(12)).toBe("+12");
		expect(signed(-5)).toBe("−5");
		expect(signed(0)).toBe("0");
	});
});

describe("scopeOptions", () => {
	const empty = { points: [], stats: null };
	const trends: HeadcountTrends = {
		configured: true,
		date: "2026-09-11",
		days: ["2026-09-11"],
		bucket: 60,
		event: empty,
		levels: [
			{ floor: "Level 1", ...empty },
			{ floor: null, ...empty },
		],
		halls: [
			{ id: 1, name: "Hall A", floor: "Level 1", status: "ok", ...empty },
			{ id: 2, name: "Hall B", floor: null, status: "unlinked", ...empty },
		],
		generatedAt: "",
	};

	test("lists the event, each level and only halls with a working counter", () => {
		expect(scopeOptions(trends).map((o) => [o.value, o.label])).toEqual([
			["event", "Whole event"],
			["compare:levels", "Compare levels"],
			["level:Level 1", "Level 1"],
			["level:", "No level set"],
			["hall:1", "Hall A"],
		]);
	});
});

describe("compareRows", () => {
	test("puts each source in its own column on a shared time axis", () => {
		const pt = (time: string, occupancy: number) => ({
			time,
			occupancy,
			entries: 0,
			exits: 0,
		});
		const rows = compareRows([
			{
				key: "h1",
				name: "KH",
				points: [pt("2026-10-30T09:00:00", 5), pt("2026-10-30T10:00:00", 8)],
			},
			{ key: "h2", name: "SH", points: [pt("2026-10-30T09:00:00", 2)] },
		]);
		expect(rows).toEqual([
			{ time: "2026-10-30T09:00:00", label: "09:00", h1: 5, h2: 2 },
			{ time: "2026-10-30T10:00:00", label: "10:00", h1: 8 },
		]);
	});
});

describe("12-hour clock", () => {
	test("timeLabel", () => {
		expect(timeLabel("2026-09-11T14:15:00", true)).toBe("2:15 PM");
		expect(timeLabel("2026-09-11T00:05:00", true)).toBe("12:05 AM");
		expect(timeLabel("2026-09-11T12:00:00", true)).toBe("12:00 PM");
		expect(timeLabel("2026-09-11T14:15:00")).toBe("14:15");
	});

	test("hourRange keeps one AM/PM when both ends share it", () => {
		expect(hourRange("2026-09-11T13:00:00", true)).toBe("1:00–2:00 PM");
		expect(hourRange("2026-09-11T11:00:00", true)).toBe("11:00 AM–12:00 PM");
		expect(hourRange("2026-09-11T23:00:00", true)).toBe("11:00 PM–12:00 AM");
		expect(hourRange("2026-09-11T13:00:00")).toBe("13:00–14:00");
	});
});
