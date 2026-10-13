import type { HallStatus } from "@/lib/api/event/hall";

/** "—" when there is no figure (unlinked hall, counter unreachable). */
export function formatCount(value: number | null): string {
	return value === null ? "—" : value.toLocaleString("en-US");
}

/** Share of capacity in use, uncapped so overcrowding shows as >100. Null when it can't be computed. */
export function occupancyPercent(
	insideNow: number | null,
	capacity: number | null,
): number | null {
	if (insideNow === null || !capacity) return null;
	return Math.round((insideNow / capacity) * 100);
}

export type Tone = "emerald" | "amber" | "red" | "slate";

/** How full a hall is: calm, getting busy, over capacity, or no figure. */
export function occupancyTone(percent: number | null): Tone {
	if (percent === null) return "slate";
	if (percent > 100) return "red";
	if (percent >= 70) return "amber";
	return "emerald";
}

// Full class names (not built from the tone) so Tailwind can see them.
export const toneClasses: Record<
	Tone,
	{ border: string; text: string; bar: string }
> = {
	emerald: {
		border: "border-l-emerald-500",
		text: "text-emerald-600 dark:text-emerald-400",
		bar: "bg-emerald-500",
	},
	amber: {
		border: "border-l-amber-500",
		text: "text-amber-600 dark:text-amber-400",
		bar: "bg-amber-500",
	},
	red: {
		border: "border-l-red-500",
		text: "text-red-600 dark:text-red-400",
		bar: "bg-red-500",
	},
	slate: {
		border: "border-l-slate-400",
		text: "text-muted-foreground",
		bar: "bg-slate-400",
	},
};

export function floorLabel(floor: string | null): string {
	return floor ? floor : "No level set";
}

export const statusMessage: Record<Exclude<HallStatus, "ok">, string> = {
	unlinked: "No counter linked yet",
	not_found: "Counter no longer exists",
	unavailable: "Counter unreachable",
};
