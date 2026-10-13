import type { HeadcountHall } from "@/lib/api/event/hall";
import { occupancyPercent } from "./format";

/** From this share of capacity a hall is flagged as nearly full. */
export const NEAR_CAPACITY_PERCENT = 90;

export interface CapacityAlert {
	hallId: number;
	hallName: string;
	floor: string | null;
	level: "over" | "near";
	percent: number;
	insideNow: number;
	capacity: number;
}

/** Halls that are over capacity or close to it, worst first. Halls without a figure or capacity are skipped. */
export function capacityAlerts(halls: HeadcountHall[]): CapacityAlert[] {
	const alerts: CapacityAlert[] = [];

	for (const hall of halls) {
		if (hall.status !== "ok" || hall.insideNow === null || !hall.capacity) {
			continue;
		}
		const percent = occupancyPercent(hall.insideNow, hall.capacity);
		if (percent === null || percent < NEAR_CAPACITY_PERCENT) continue;

		alerts.push({
			hallId: hall.id,
			hallName: hall.name,
			floor: hall.floor,
			level: percent > 100 ? "over" : "near",
			percent,
			insideNow: hall.insideNow,
			capacity: hall.capacity,
		});
	}

	return alerts.sort((a, b) => b.percent - a.percent);
}
