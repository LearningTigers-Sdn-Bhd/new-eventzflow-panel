"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDailyBreakdown } from "@/hooks/use-event-halls";
import { formatCount } from "./format";
import { StatTile } from "./stat-tile";
import { dayLabel, shortDayLabel, timeLabel } from "./trend-format";

/** Every event day at a glance: totals, the best day, and one plain bar per day with its number on it. */
export function AllDaysSummary({
	eventId,
	hour12,
}: {
	eventId: string;
	hour12: boolean;
}) {
	const { data } = useDailyBreakdown(eventId);
	const days = data?.days ?? [];
	if (days.length === 0) return null;

	const total = days.reduce((sum, d) => sum + d.entries, 0);
	const best = days.reduce((a, b) => (b.entries > a.entries ? b : a));
	const crowded = days.reduce<(typeof days)[number] | null>(
		(a, b) =>
			b.peak && (!a?.peak || b.peak.occupancy > a.peak.occupancy) ? b : a,
		null,
	);
	const max = Math.max(...days.map((d) => d.entries), 1);

	return (
		<>
			<div className="grid @3xl:grid-cols-3 grid-cols-1 gap-2">
				<StatTile
					label="Visitors · all days"
					value={total}
					hint={`${days.length} days`}
					accent="border-l-emerald-500"
				/>
				<StatTile
					label="Best day"
					value={best.entries}
					hint={`visitors on ${dayLabel(best.date)}`}
					accent="border-l-sky-500"
				/>
				<StatTile
					label="Most people at once"
					value={crowded?.peak?.occupancy ?? null}
					hint={
						crowded?.peak
							? `${shortDayLabel(crowded.date)} at ${timeLabel(crowded.peak.at, hour12)}`
							: "No movement yet"
					}
					accent="border-l-amber-500"
				/>
			</div>

			<Card className="gap-0 rounded-none shadow-none">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-sm">Visitors per day</CardTitle>
					<CardDescription className="text-xs">
						People who came in each day. Pick a day above to see it hour by
						hour.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{days.map((d) => (
						<div
							key={d.date}
							className="grid grid-cols-[6rem_1fr_4rem] items-center gap-3 text-sm"
						>
							<span className="text-muted-foreground">
								{shortDayLabel(d.date)}
							</span>
							<div className="h-6 bg-muted">
								<div
									className="h-full bg-emerald-500"
									style={{ width: `${(d.entries / max) * 100}%` }}
								/>
							</div>
							<span className="text-right font-medium tabular-nums">
								{formatCount(d.entries)}
							</span>
						</div>
					))}
				</CardContent>
			</Card>
		</>
	);
}
