import type {
	HeadcountTrends,
	TrendPoint,
	TrendScope,
} from "@/lib/api/event/hall";
import { floorLabel } from "./format";

/** 14, "05" -> "2:05 PM". */
function clock12(hour: number, minute: string): string {
	return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

/** "2026-09-11T14:15:00" -> "14:15", or "2:15 PM" with `hour12`. Strings are sliced, never parsed, so no timezone can shift them. */
export function timeLabel(iso: string, hour12 = false): string {
	return hour12
		? clock12(Number(iso.slice(11, 13)), iso.slice(14, 16))
		: iso.slice(11, 16);
}

/** "2026-09-11T14:00:00" -> "14:00–15:00", or "2:00–3:00 PM" with `hour12`. */
export function hourRange(iso: string, hour12 = false): string {
	const hour = Number(iso.slice(11, 13));
	const next = (hour + 1) % 24;
	if (!hour12) return `${timeLabel(iso)}–${String(next).padStart(2, "0")}:00`;
	const start = clock12(hour, "00");
	const end = clock12(next, "00");
	// "1:00–2:00 PM" when both ends sit in the same half of the day, else spell both out.
	return hour < 12 === next < 12
		? `${start.slice(0, -3)}–${end}`
		: `${start}–${end}`;
}

/** "2026-09-11" -> "11 Sep 2026". */
export function dayLabel(day: string): string {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/** "2026-09-11" -> "Friday, 11 September 2026". */
export function longDayLabel(day: string): string {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/** "2026-09-11" -> "11 Sep". */
export function shortDayLabel(day: string): string {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
}

/** +12 / −5 / 0, with a real minus sign. */
export function signed(value: number): string {
	if (value > 0) return `+${value.toLocaleString("en-US")}`;
	if (value < 0) return `−${Math.abs(value).toLocaleString("en-US")}`;
	return "0";
}

export interface ScopeOption {
	/** "event", "level:<floor>" or "hall:<id>". */
	value: string;
	label: string;
	group: "Event" | "Compare" | "Levels" | "Halls";
	scope: TrendScope;
	/** Set on compare options: one line per hall / level, drawn on the same chart. */
	series?: CompareSource[];
}

export interface CompareSource {
	key: string;
	name: string;
	points: TrendPoint[];
}

/** One chart row per time slot, with a `<key>` column per source so each hall / level gets its own line. */
export function compareRows(
	sources: CompareSource[],
	metric: "occupancy" | "entries" | "exits" = "occupancy",
	hour12 = false,
): Record<string, string | number>[] {
	const rows = new Map<string, Record<string, string | number>>();
	for (const source of sources) {
		for (const p of source.points) {
			const row = rows.get(p.time) ?? {
				time: p.time,
				label: timeLabel(p.time, hour12),
			};
			row[source.key] = p[metric];
			rows.set(p.time, row);
		}
	}
	return [...rows.values()].sort((a, b) =>
		String(a.time).localeCompare(String(b.time)),
	);
}

/** Everything the chart can be pointed at: the whole event, each level, each linked hall. */
export function scopeOptions(trends: HeadcountTrends): ScopeOption[] {
	const linked = trends.halls.filter((hall) => hall.status === "ok");
	const compare: ScopeOption[] = [];
	if (linked.length > 1) {
		compare.push({
			value: "compare:halls",
			label: "Compare halls",
			group: "Compare",
			scope: trends.event,
			series: linked.map((h) => ({
				key: `h${h.id}`,
				name: h.name,
				points: h.points,
			})),
		});
	}
	if (trends.levels.length > 1) {
		compare.push({
			value: "compare:levels",
			label: "Compare levels",
			group: "Compare",
			scope: trends.event,
			series: trends.levels.map((l) => ({
				key: `l${l.floor ?? ""}`,
				name: floorLabel(l.floor),
				points: l.points,
			})),
		});
	}
	return [
		{
			value: "event",
			label: "Whole event",
			group: "Event",
			scope: trends.event,
		},
		...compare,
		...trends.levels.map((level) => ({
			value: `level:${level.floor ?? ""}`,
			label: floorLabel(level.floor),
			group: "Levels" as const,
			scope: level,
		})),
		...trends.halls
			.filter((hall) => hall.status === "ok")
			.map((hall) => ({
				value: `hall:${hall.id}`,
				label: hall.name,
				group: "Halls" as const,
				scope: hall,
			})),
	];
}
