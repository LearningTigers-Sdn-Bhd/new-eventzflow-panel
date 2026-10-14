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
const peakAt = (scope: TrendScope) => {
	const peak = peakOf(scope);
	return peak ? timeLabel(peak.at) : DASH;
};

const closingOf = (scope: TrendScope) => scope.points.at(-1)?.occupancy ?? null;

/** The headline numbers for the day, event-wide. */
export function headlineFigures(trends: HeadcountTrends, headcount: Headcount) {
	const { event } = trends;
	const stats = event.stats;
	return {
		peak: stats ? stats.peak.occupancy : null,
		peakAt: stats ? timeLabel(stats.peak.at) : null,
		entries: sum(event.points, "entries"),
		exits: sum(event.points, "exits"),
		busiest: stats ? stats.busiestEntryHour.entries : null,
		busiestHour: stats ? hourRange(stats.busiestEntryHour.at) : null,
		closing: closingOf(event),
		capacity: headcount.event.capacity,
	};
}

/** One row per level: level, capacity, peak crowd, peak time, came in, left, verdict. */
export function levelRows(
	trends: HeadcountTrends,
	headcount: Headcount,
): string[][] {
	return trends.levels.map((level) => {
		const capacity =
			headcount.levels.find((l) => l.floor === level.floor)?.capacity ?? null;
		const peak = peakOf(level)?.occupancy ?? null;
		return [
			floorLabel(level.floor),
			formatCount(capacity),
			formatCount(peak),
			peakAt(level),
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

/** One row per event day: day, came in, left, peak crowd (with time), busiest hour, inside at close. */
export function dayRows(days: DaySummary[]): string[][] {
	return days.map((d) => [
		shortDayLabel(d.date),
		formatCount(d.entries),
		formatCount(d.exits),
		d.peak
			? `${formatCount(d.peak.occupancy)} at ${timeLabel(d.peak.at)}`
			: DASH,
		d.busiestEntryHour ? hourRange(d.busiestEntryHour.at) : DASH,
		formatCount(d.closing),
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
