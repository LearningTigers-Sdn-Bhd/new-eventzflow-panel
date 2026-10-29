"use client";

import { useDailyBreakdown } from "@/hooks/use-event-halls";
import { cn } from "@/lib/utils";
import { formatCount } from "./format";
import { shortDayLabel, timeLabel } from "./trend-format";

export const ALL_DAYS = "all";

const weekday = (day: string) => {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date).toLocaleDateString("en-GB", {
		weekday: "short",
	});
};

interface DayPickerProps {
	eventId: string;
	/** A "YYYY-MM-DD" day, or ALL_DAYS. */
	selected: string;
	onSelect: (value: string) => void;
	hour12: boolean;
}

/** One card per event day with its visitor count, plus "All days". Picking a card changes everything below it. */
export function DayPicker({
	eventId,
	selected,
	onSelect,
	hour12,
}: DayPickerProps) {
	const { data } = useDailyBreakdown(eventId);
	const days = data?.days ?? [];
	if (!data?.configured || days.length === 0) return null;

	const total = days.reduce((sum, d) => sum + d.entries, 0);
	const card = (active: boolean) =>
		cn(
			"flex min-w-44 flex-1 flex-col gap-1 border p-3 text-left transition-colors hover:bg-muted/50",
			active ? "border-primary bg-muted" : "border-border",
		);

	return (
		<div className="space-y-2">
			<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				Pick a day
			</p>
			<div className="flex gap-2 overflow-x-auto pb-1">
				{days.map((d) => (
					<button
						key={d.date}
						type="button"
						aria-pressed={selected === d.date}
						onClick={() => onSelect(d.date)}
						className={card(selected === d.date)}
					>
						<span className="text-muted-foreground text-xs">
							{weekday(d.date)} · {shortDayLabel(d.date)}
						</span>
						<span className="font-bold text-2xl tabular-nums leading-none">
							{formatCount(d.entries)}
						</span>
						<span className="text-muted-foreground text-xs">
							visitors
							{d.peak &&
								` · busiest ${formatCount(d.peak.occupancy)} at ${timeLabel(d.peak.at, hour12)}`}
						</span>
					</button>
				))}
				{days.length > 1 && (
					<button
						type="button"
						aria-pressed={selected === ALL_DAYS}
						onClick={() => onSelect(ALL_DAYS)}
						className={card(selected === ALL_DAYS)}
					>
						<span className="text-muted-foreground text-xs">
							All {days.length} days
						</span>
						<span className="font-bold text-2xl tabular-nums leading-none">
							{formatCount(total)}
						</span>
						<span className="text-muted-foreground text-xs">
							visitors in total
						</span>
					</button>
				)}
			</div>
		</div>
	);
}
