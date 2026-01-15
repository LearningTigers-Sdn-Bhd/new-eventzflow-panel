/**
 * Recent Scan Card Component
 * Displays a single recent scan result in compact format
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getStatusIcon, getStatusVariant, TypeBadge } from "../status-helpers";
import type { ScanResult } from "../types";

interface RecentScanCardProps {
	scan: ScanResult;
}

export function RecentScanCard({ scan }: RecentScanCardProps) {
	const variant = getStatusVariant(scan.status);

	const timeStr = scan.timestamp.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	const dateStr = scan.timestamp.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	return (
		<div
			className={cn(
				"slide-in-from-top-2 animate-in rounded-lg border-2 p-3 duration-300",
				variant.bg,
				variant.border,
			)}
		>
			<div className="mb-2 flex items-start gap-2">
				<div className={cn("rounded-md p-1.5", variant.iconBg)}>
					{getStatusIcon(scan.status)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-semibold text-sm">
						{scan.name || "Unknown"}
					</p>
					<p
						className={cn(
							"truncate text-xs",
							scan.email
								? "text-muted-foreground"
								: "text-muted-foreground/60 italic",
						)}
					>
						{scan.email || "No email"}
					</p>
					<div className="mt-1 flex flex-wrap gap-1">
						<TypeBadge type={scan.type} role={scan.role} />
					</div>
				</div>
			</div>
			<p className="truncate font-mono text-muted-foreground text-xs">
				{scan.scanId}
			</p>
			<div className="mt-1 flex flex-col">
				<span className="text-sm font-medium">{timeStr}</span>
				<span className="text-xs text-muted-foreground">{dateStr}</span>
			</div>
		</div>
	);
}
