import { AlertCircle, CheckCircle2, Clock, Hash, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanResult } from "./types";

interface ScanResultCardProps {
	result: ScanResult;
	index: number;
	isRecent: boolean;
}

export function ScanResultCard({
	result,
	index,
	isRecent,
}: ScanResultCardProps) {
	const statusConfig = {
		success: {
			bg: "bg-green-50 dark:bg-green-950/20",
			border: "border-green-200 dark:border-green-900/30",
			iconBg: "bg-green-500/20",
			icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
			badgeBg: "bg-green-500/20 text-green-700 dark:text-green-400",
		},
		error: {
			bg: "bg-red-50 dark:bg-red-950/20",
			border: "border-red-200 dark:border-red-900/30",
			iconBg: "bg-red-500/20",
			icon: <XCircle className="h-5 w-5 text-red-600" />,
			badgeBg: "bg-red-500/20 text-red-700 dark:text-red-400",
		},
		duplicate: {
			bg: "bg-yellow-50 dark:bg-yellow-950/20",
			border: "border-yellow-200 dark:border-yellow-900/30",
			iconBg: "bg-yellow-500/20",
			icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
			badgeBg: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
		},
	};

	const config = statusConfig[result.status];

	return (
		<div
			className={cn(
				"rounded-xl border-2 p-4 transition-all duration-500",
				config.bg,
				config.border,
				isRecent && "scale-[1.02] shadow-xl ring-2 ring-primary",
			)}
		>
			<div className="mb-3 flex items-start gap-3">
				<div className={cn("rounded-lg p-2", config.iconBg)}>{config.icon}</div>
				<div className="min-w-0 flex-1">
					<div className="mb-1 flex items-start justify-between gap-2">
						<p className="font-bold text-base">
							{result.attendeeName || "Unknown"}
						</p>
						<span className="shrink-0 rounded border bg-background/60 px-2 py-1 font-mono text-xs">
							#{index}
						</span>
					</div>
					{result.attendeeEmail && (
						<p className="truncate text-muted-foreground text-xs">
							{result.attendeeEmail}
						</p>
					)}
					{result.ticketType && (
						<p className="font-medium text-muted-foreground text-xs">
							{result.ticketType}
							{result.ticketValue && ` • $${result.ticketValue}`}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2 text-xs">
					<Hash className="h-3.5 w-3.5 text-muted-foreground" />
					<p className="truncate font-mono text-muted-foreground">
						{result.ticketId}
					</p>
				</div>
				<div className="flex items-center justify-between text-xs">
					<span className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="h-3.5 w-3.5" />
						{result.timestamp.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					</span>
					<span
						className={cn(
							"rounded-full px-2 py-0.5 font-medium text-xs",
							config.badgeBg,
						)}
					>
						{result.message}
					</span>
				</div>
			</div>
		</div>
	);
}
