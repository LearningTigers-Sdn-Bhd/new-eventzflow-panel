import { Badge } from "@/components/ui/badge";
import type { HeadcountHall } from "@/lib/api/event/hall";
import { cn } from "@/lib/utils";
import { BigScreenLink } from "./big-screen-link";
import {
	formatCount,
	occupancyPercent,
	occupancyTone,
	statusMessage,
	toneClasses,
} from "./format";

function Figure({ label, value }: { label: string; value: number | null }) {
	return (
		<div>
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="font-medium text-sm tabular-nums">{formatCount(value)}</dd>
		</div>
	);
}

/** One hall: people inside now against its capacity, plus today's and the whole event's in/out. */
export function HallCard({ hall }: { hall: HeadcountHall }) {
	const hasData = hall.status === "ok";
	const percent = occupancyPercent(hall.insideNow, hall.capacity);
	const tone = toneClasses[hasData ? occupancyTone(percent) : "slate"];

	return (
		<div
			data-hall-id={hall.id}
			className={cn("flex flex-col gap-3 border border-l-4 p-3", tone.border)}
		>
			<div className="flex items-start justify-between gap-2">
				<p className="font-medium text-sm">{hall.name}</p>
				{!hasData ? (
					<Badge variant="outline" className="rounded-none">
						{statusMessage[hall.status as keyof typeof statusMessage]}
					</Badge>
				) : percent !== null && percent > 100 ? (
					<Badge variant="destructive" className="rounded-none">
						Over capacity
					</Badge>
				) : null}
			</div>

			<div>
				<p
					className={cn(
						"font-bold text-3xl tabular-nums leading-none",
						tone.text,
					)}
				>
					{formatCount(hall.insideNow)}
				</p>
				<p className="mt-1 text-muted-foreground text-xs">
					inside now
					{hall.capacity ? ` · capacity ${formatCount(hall.capacity)}` : ""}
				</p>
			</div>

			{percent !== null && (
				<div
					className="h-2.5 w-full bg-muted"
					role="img"
					aria-label={`${hall.name} is ${percent}% full`}
				>
					<div
						className={cn("h-full transition-all", tone.bar)}
						style={{ width: `${Math.min(percent, 100)}%` }}
					/>
				</div>
			)}

			<dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3">
				<Figure label="In today" value={hall.inToday} />
				<Figure label="Out today" value={hall.outToday} />
				<Figure label="In · whole event" value={hall.inEvent} />
				<Figure label="Out · whole event" value={hall.outEvent} />
			</dl>

			<div className="border-t pt-3">
				<BigScreenLink compact level={hall.floor} hall={hall.name} />
			</div>
		</div>
	);
}
