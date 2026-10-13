import { AlertTriangle, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { type CapacityAlert, NEAR_CAPACITY_PERCENT } from "./alerts";
import { floorLabel, formatCount } from "./format";

/** Halls over capacity (red) or close to it (amber). Renders nothing when every hall has room. */
export function CapacityAlerts({ alerts }: { alerts: CapacityAlert[] }) {
	if (alerts.length === 0) return null;

	return (
		<div role="alert" className="space-y-px border bg-border">
			{alerts.map((alert) => {
				const over = alert.level === "over";
				const Icon = over ? OctagonAlert : AlertTriangle;

				return (
					<div
						key={alert.hallId}
						className={cn(
							"flex items-start gap-3 p-3 text-sm",
							over
								? "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
								: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
						)}
					>
						<Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
						<p>
							<span className="font-medium">{alert.hallName}</span>{" "}
							<span className="opacity-75">({floorLabel(alert.floor)})</span>{" "}
							{over ? "is over capacity" : `is ${alert.percent}% full`}:{" "}
							{formatCount(alert.insideNow)} people inside, capacity{" "}
							{formatCount(alert.capacity)}.
						</p>
					</div>
				);
			})}
			<p className="sr-only">
				Halls are flagged from {NEAR_CAPACITY_PERCENT}% of capacity.
			</p>
		</div>
	);
}
