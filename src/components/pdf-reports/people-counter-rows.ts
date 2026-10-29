import { NEAR_CAPACITY_PERCENT } from "@/components/pages/headcount/alerts";
import {
	floorLabel,
	formatCount,
	statusMessage,
} from "@/components/pages/headcount/format";
import {
	hourRange,
	shortDayLabel,
	timeLabel,
} from "@/components/pages/headcount/trend-format";
import type {
	DaySummary,
	Headcount,
	HeadcountTrends,
	TrendPoint,
	TrendScope,
} from "@/lib/api/event/hall";

const DASH = "—";

/** How a peak compares with capacity, in words. Mirrors the Excel report's chips. */
export function capacityVerdict(
	peak: number | null,
	capacity: number | null,
): string {
	if (peak === null || !capacity) return "No capacity set";
	const percent = (peak * 100) / capacity;
	if (percent > 100) return "Over capacity";
	if (percent >= NEAR_CAPACITY_PERCENT) return "Nearly full";
	return "Within capacity";
}

const sum = (points: TrendPoint[], key: "entries" | "exits") =>
	points.reduce((total, p) => total + p[key], 0);

const peakOf = (scope: TrendScope) => scope.stats?.peak ?? null;

/** "14:15" or a dash. */
const peakAt = (scope: TrendScope, hour12: boolean) => {
	const peak = peakOf(scope);
	return peak ? timeLabel(peak.at, hour12) : DASH;
};

/** The headline numbers for the day, event-wide. */
export function headlineFigures(
	trends: HeadcountTrends,
	headcount: Headcount,
	hour12 = false,
) {
	const { event } = trends;
	const stats = event.stats;
	return {
		peak: stats ? stats.peak.occupancy : null,
		peakAt: stats ? timeLabel(stats.peak.at, hour12) : null,
		entries: sum(event.points, "entries"),
		exits: sum(event.points, "exits"),
		busiest: stats ? stats.busiestEntryHour.entries : null,
		busiestHour: stats ? hourRange(stats.busiestEntryHour.at, hour12) : null,
		capacity: headcount.event.capacity,
	};
}

/** One row per level: level, capacity, peak crowd, peak time, came in, left, verdict. */
export function levelRows(
	trends: HeadcountTrends,
	headcount: Headcount,
	hour12 = false,
): string[][] {
	return trends.levels.map((level) => {
		const capacity =
			headcount.levels.find((l) => l.floor === level.floor)?.capacity ?? null;
		const peak = peakOf(level)?.occupancy ?? null;
		return [
			floorLabel(level.floor),
			formatCount(capacity),
			formatCount(peak),
			peakAt(level, hour12),
			formatCount(sum(level.points, "entries")),
			formatCount(sum(level.points, "exits")),
			capacityVerdict(peak, capacity),
		];
	});
}

/** One row per hall: hall, level, capacity, peak crowd, came in, left, counter / verdict. */
export function hallRows(
	trends: HeadcountTrends,
	headcount: Headcount,
): string[][] {
	return trends.halls.map((hall) => {
		const capacity =
			headcount.halls.find((h) => h.id === hall.id)?.capacity ?? null;
		const peak = peakOf(hall)?.occupancy ?? null;
		return [
			hall.name,
			floorLabel(hall.floor),
			formatCount(capacity),
			formatCount(peak),
			formatCount(sum(hall.points, "entries")),
			formatCount(sum(hall.points, "exits")),
			hall.status === "ok"
				? capacityVerdict(peak, capacity)
				: statusMessage[hall.status as keyof typeof statusMessage],
		];
	});
}

/** One row per event day: day, visitors, left, peak crowd (with time), busiest hour. */
export function dayRows(days: DaySummary[], hour12 = false): string[][] {
	return days.map((d) => [
		shortDayLabel(d.date),
		formatCount(d.entries),
		formatCount(d.exits),
		d.peak
			? `${formatCount(d.peak.occupancy)} at ${timeLabel(d.peak.at, hour12)}`
			: DASH,
		d.busiestEntryHour ? hourRange(d.busiestEntryHour.at, hour12) : DASH,
	]);
}

/** Chart input: the counter's "2026-10-30T14:00:00" as the "2026-10-30 14:00" the PDF charts read. */
export function chartSeries(
	points: TrendPoint[],
	key: "occupancy" | "entries" | "exits",
): { date: string; value: number }[] {
	return points.map((p) => ({
		date: `${p.time.slice(0, 10)} ${p.time.slice(11, 16)}`,
		value: p[key],
	}));
}

/** One row per hall over the whole event: hall, level, visitors, share of everyone counted. */
export function hallTotalRows(headcount: Headcount): string[][] {
	const total = headcount.halls.reduce((sum, h) => sum + (h.inEvent ?? 0), 0);
	return headcount.halls.map((h) => [
		h.name,
		floorLabel(h.floor),
		formatCount(h.inEvent),
		total > 0 && h.inEvent !== null
			? `${Math.round((h.inEvent / total) * 100)}%`
			: DASH,
	]);
}

/** Bar chart input: visitors per event day, labelled "11 Sep". */
export function dayBars(
	days: DaySummary[],
): { period: string; value: number }[] {
	return days.map((d) => ({ period: shortDayLabel(d.date), value: d.entries }));
}

/** The whole-event headline: totals, best and quietest day, the average, and the biggest crowd. Needs at least one day. */
export function allDaysFigures(days: DaySummary[], hour12 = false) {
	const total = days.reduce((n, d) => n + d.entries, 0);
	const best = days.reduce((a, b) => (b.entries > a.entries ? b : a));
	const quiet = days.reduce((a, b) => (b.entries < a.entries ? b : a));
	const crowded = days.reduce<DaySummary | null>((a, b) => {
		if (!b.peak) return a;
		return !a?.peak || b.peak.occupancy > a.peak.occupancy ? b : a;
	}, null);
	return {
		total,
		exits: days.reduce((n, d) => n + d.exits, 0),
		average: Math.round(total / days.length),
		best,
		quiet,
		crowded,
		crowdedAt: crowded?.peak ? timeLabel(crowded.peak.at, hour12) : null,
	};
}

/** One row per hall, one column per day, then the total: who came in where, day by day. */
export function hallDayRows(days: DaySummary[]): string[][] {
	const halls = days.at(-1)?.halls ?? [];
	return halls.map((hall) => {
		const counts = days.map(
			(d) => d.halls.find((h) => h.id === hall.id)?.entries ?? null,
		);
		const total = counts.reduce<number>((n, c) => n + (c ?? 0), 0);
		return [
			hall.name,
			floorLabel(hall.floor),
			...counts.map((c) => formatCount(c)),
			formatCount(total),
		];
	});
}
