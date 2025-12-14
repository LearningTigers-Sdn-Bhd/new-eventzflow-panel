import { ChartBar } from "lucide-react";
import {
	type Indicator,
	ProgressStatsCard,
} from "@/components/admin-ui/analytic/stats-card";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import type { ScanResult } from "./types";

interface StatsGridProps {
	scanResults: ScanResult[];
}

export function StatsGrid({ scanResults }: StatsGridProps) {
	const totalScans = scanResults.length;
	const validScans = scanResults.filter((r) => r.status === "success").length;
	const invalidScans = scanResults.filter((r) => r.status === "error").length;
	const duplicateScans = scanResults.filter(
		(r) => r.status === "duplicate",
	).length;

	return (
		<div className="flex h-full flex-col border md:border-0">
			<div className="flex flex-col gap-4 pb-4">
				<div className="w-full">
					<IconTitle
						icon={ChartBar}
						title="Statistics"
						description="View the statistics for the ticket scanner and event"
					/>
				</div>
			</div>
			<div className="h-full border-b border-dashed">
				<ProgressStatsCard
					data={{
						icon: ChartBar,
						title: "Overall Scan Results",
						subtitle: "Overview of ticket scanning results",
						indicators: [
							{
								label: "Total Scans",
								count: totalScans,
								color: "blue",
								isTotal: true,
							},
							{
								label: "Valid",
								count: validScans,
								color: "green",
							},
							{
								label: "Invalid",
								count: invalidScans,
								color: "red",
							},
							{
								label: "Duplicate",
								count: duplicateScans,
								color: "yellow",
							},
						] satisfies Indicator[],
						progressValue: validScans,
					}}
				/>
			</div>
		</div>
	);
}
