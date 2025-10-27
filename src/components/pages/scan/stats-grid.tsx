import { AlertCircle, CheckCircle2, Ticket, XCircle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
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
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-5">
			<Card className="border-primary/30 bg-linear-to-br from-primary/5 to-primary/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-primary/20 p-2 sm:p-2.5">
						<Ticket className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Total Scans
						</p>
						<p className="mt-0.5 font-bold text-xl sm:text-2xl">{totalScans}</p>
					</div>
				</div>
			</Card>

			<Card className="border-green-500/30 bg-linear-to-br from-green-500/5 to-green-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-green-500/20 p-2 sm:p-2.5">
						<CheckCircle2 className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Valid
						</p>
						<p className="mt-0.5 font-bold text-green-600 text-xl sm:text-2xl">
							{validScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="border-red-500/30 bg-linear-to-br from-red-500/5 to-red-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-red-500/20 p-2 sm:p-2.5">
						<XCircle className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Invalid
						</p>
						<p className="mt-0.5 font-bold text-red-600 text-xl sm:text-2xl">
							{invalidScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="border-yellow-500/30 bg-linear-to-br from-yellow-500/5 to-yellow-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-yellow-500/20 p-2 sm:p-2.5">
						<AlertCircle className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Duplicate
						</p>
						<p className="mt-0.5 font-bold text-xl text-yellow-600 sm:text-2xl">
							{duplicateScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="border-blue-500/30 bg-linear-to-br from-blue-500/5 to-blue-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-blue-500/20 p-2 sm:p-2.5">
						<Zap className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Success Rate
						</p>
						<p className="mt-0.5 font-bold text-blue-600 text-xl sm:text-2xl">
							{successRate}%
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
