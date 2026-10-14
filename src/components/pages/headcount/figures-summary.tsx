import type { HeadcountFigures } from "@/lib/api/event/hall";
import { cn } from "@/lib/utils";
import {
	formatCount,
	occupancyPercent,
	occupancyTone,
	toneClasses,
} from "./format";
import { StatTile } from "./stat-tile";

/** People inside against capacity, beside today's and the whole event's in/out. Used for the event and for each level. */
export function FiguresSummary({
	figures,
	capacityLabel,
}: {
	figures: HeadcountFigures;
	/** What the capacity belongs to, e.g. "total" or "level". */
	capacityLabel: string;
}) {
	const percent = occupancyPercent(figures.insideNow, figures.capacity);
	const tone = toneClasses[occupancyTone(percent)];

	return (
		<div className="grid @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
			<div className="space-y-3">
				<p
					className={cn(
						"flex items-center gap-1.5 font-medium text-xs uppercase tracking-wide",
						tone.text,
					)}
				>
					<span className={cn("size-2", tone.bar)} />
					Inside now
				</p>
				<p
					className={cn(
						"font-bold text-5xl tabular-nums leading-none",
						tone.text,
					)}
				>
					{formatCount(figures.insideNow)}
				</p>
				{percent !== null && (
					<div className="space-y-1.5">
						<div
							className="h-2.5 w-full bg-muted"
							role="img"
							aria-label={`${percent}% of ${capacityLabel} capacity`}
						>
							<div
								className={cn("h-full transition-all", tone.bar)}
								style={{ width: `${Math.min(percent, 100)}%` }}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							{percent}% of the {formatCount(figures.capacity)} {capacityLabel}{" "}
							capacity
						</p>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2">
				<StatTile
					label="In today"
					value={figures.inToday}
					hint="Since midnight"
					accent="border-l-emerald-500"
				/>
				<StatTile
					label="Out today"
					value={figures.outToday}
					hint="Since midnight"
					accent="border-l-amber-500"
				/>
				<StatTile
					label="Entries · whole event"
					value={figures.inEvent}
					hint="Event start to end"
					accent="border-l-sky-500"
				/>
				<StatTile
					label="Exits · whole event"
					value={figures.outEvent}
					hint="Event start to end"
					accent="border-l-slate-400"
				/>
			</div>
		</div>
	);
}
