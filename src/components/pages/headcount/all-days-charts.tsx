"use client";

import { LoadingState } from "@/components/data-state";
import type { ChartConfig } from "@/components/ui/chart";
import { useDailyBreakdown, useDaysTrends } from "@/hooks/use-event-halls";
import type { TrendBucket } from "@/lib/api/event/hall";
import { COMPARE_COLORS, CompareCharts } from "./compare-charts";
import { dayLabel, shortDayLabel } from "./trend-format";

/** One line per colour in the theme; more days than this would repeat colours. */
const MAX_DAYS = COMPARE_COLORS.length;

/** The two hourly charts for every event day, each day its own line on the same time-of-day axis so the days sit on top of each other. */
export function AllDaysCharts({
	eventId,
	bucket,
	hour12,
}: {
	eventId: string;
	bucket: TrendBucket;
	hour12: boolean;
}) {
	const { data } = useDailyBreakdown(eventId);
	const allDays = (data?.days ?? []).map((d) => d.date);
	const days = allDays.slice(-MAX_DAYS);
	const { trends, loading } = useDaysTrends(eventId, days, bucket);

	if (days.length === 0) return null;
	if (loading && trends.every((t) => !t)) {
		return (
			<LoadingState
				title="Loading days..."
				description="Fetching each day's counts."
				height="h-48"
			/>
		);
	}

	const series = days.map((date, i) => ({
		key: `d${i}`,
		name: shortDayLabel(date),
		// Days share one axis: drop the date, keep the clock time.
		points: (trends[i]?.event.points ?? []).map((p) => ({
			...p,
			time: `2000-01-01T${p.time.slice(11)}`,
		})),
	}));
	const config: ChartConfig = Object.fromEntries(
		series.map((s, i) => [
			s.key,
			{ label: s.name, color: COMPARE_COLORS[i % COMPARE_COLORS.length] },
		]),
	);
	const hasMovement = series.some((s) =>
		s.points.some((p) => p.entries + p.exits > 0),
	);
	const hidden = allDays.length - days.length;

	return (
		<>
			{hidden > 0 && (
				<p className="text-muted-foreground text-xs">
					Showing the latest {days.length} days. Pick an earlier day above to
					see it.
				</p>
			)}
			<CompareCharts
				series={series}
				config={config}
				bucket={bucket}
				hour12={hour12}
				by="day"
				subtitle={`${dayLabel(days[0])} to ${dayLabel(days[days.length - 1])}, one line per day`}
				hasMovement={hasMovement}
			/>
		</>
	);
}
