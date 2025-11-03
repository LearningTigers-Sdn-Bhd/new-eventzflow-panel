import {
	AlertCircle,
	ChartBar,
	CheckCircle2,
	ScanFace,
	XCircle,
	Zap,
} from "lucide-react";
import { StatsCard } from "@/components/analytics-card";
import { IconTitle } from "@/components/ui/icon-heading";
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
	const successRate =
		totalScans > 0 ? ((validScans / totalScans) * 100).toFixed(1) : "0";

	return (
		<div>
			<div className="page-header border-y border-dashed">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={ChartBar}
						title="Statistics"
						description="View the statistics for the ticket scanner and event"
					/>
				</div>
			</div>
			<div className="grid h-full grid-cols-1 gap-2 border-b border-dashed lg:grid-cols-2">
				{/* Column 1: 2x2 grid with 4 stats */}
				<div className="grid grid-cols-2 gap-2">
					<StatsCard label="Total Scans" value={totalScans} Icon={ScanFace} />
					<StatsCard label="Valid" value={validScans} Icon={CheckCircle2} />
					<StatsCard label="Invalid" value={invalidScans} Icon={XCircle} />
					<StatsCard
						label="Duplicate"
						value={duplicateScans}
						Icon={AlertCircle}
					/>
				</div>

				{/* Column 2: Success Rate */}
				<div className="h-full">
					<StatsCard
						label="Success Rate"
						value={`${successRate}%`}
						Icon={Zap}
					/>
				</div>
			</div>
		</div>
	);
}
