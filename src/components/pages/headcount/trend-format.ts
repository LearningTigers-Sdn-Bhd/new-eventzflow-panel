import type { HeadcountTrends, TrendScope } from "@/lib/api/event/hall";
import { floorLabel } from "./format";

/** "2026-09-11T14:15:00" -> "14:15". Strings are sliced, never parsed, so no timezone can shift them. */
export function timeLabel(iso: string): string {
	return iso.slice(11, 16);
}

/** "2026-09-11T14:00:00" -> "14:00–15:00". */
export function hourRange(iso: string): string {
	const hour = Number(iso.slice(11, 13));
	const next = String((hour + 1) % 24).padStart(2, "0");
	return `${timeLabel(iso)}–${next}:00`;
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
	group: "Event" | "Levels" | "Halls";
	scope: TrendScope;
}

/** Everything the chart can be pointed at: the whole event, each level, each linked hall. */
export function scopeOptions(trends: HeadcountTrends): ScopeOption[] {
	return [
		{
			value: "event",
			label: "Whole event",
			group: "Event",
			scope: trends.event,
		},
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
