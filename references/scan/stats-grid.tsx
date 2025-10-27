import { Card } from "@/components/ui/card";
import {
	Ticket,
	CheckCircle2,
	XCircle,
	AlertCircle,
	TrendingUp,
	Zap,
	User,
	Clock,
} from "lucide-react";
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
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
			<Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-2 sm:p-2.5 rounded-lg bg-primary/20 shrink-0">
						<Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
							Total Scans
						</p>
						<p className="text-xl sm:text-2xl font-bold mt-0.5">{totalScans}</p>
					</div>
				</div>
			</Card>

			<Card className="p-3 sm:p-4 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/30">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-2 sm:p-2.5 rounded-lg bg-green-500/20 shrink-0">
						<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Valid</p>
						<p className="text-xl sm:text-2xl font-bold text-green-600 mt-0.5">
							{validScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-3 sm:p-4 bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/30">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-2 sm:p-2.5 rounded-lg bg-red-500/20 shrink-0">
						<XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
							Invalid
						</p>
						<p className="text-xl sm:text-2xl font-bold text-red-600 mt-0.5">
							{invalidScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/30">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-2 sm:p-2.5 rounded-lg bg-yellow-500/20 shrink-0">
						<AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
							Duplicate
						</p>
						<p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-0.5">
							{duplicateScans}
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/30">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/20 shrink-0">
						<Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
							Success Rate
						</p>
						<p className="text-xl sm:text-2xl font-bold text-blue-600 mt-0.5">
							{successRate}%
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
