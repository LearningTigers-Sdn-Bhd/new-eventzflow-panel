/**
 * Recent Scan Card Component
 * Displays a single recent scan result in compact format
 */

import { cn } from "@/lib/utils";
import type { ScanResult } from "./types";
import { getStatusIcon, getStatusVariant } from "./status-helpers";

interface RecentScanCardProps {
	scan: ScanResult;
}

export function RecentScanCard({ scan }: RecentScanCardProps) {
	const variant = getStatusVariant(scan.status);

	return (
		<div
			className={cn(
				"p-3 rounded-lg border-2 animate-in slide-in-from-top-2 duration-300",
				variant.bg,
				variant.border
			)}
		>
			<div className="flex items-start gap-2 mb-2">
				<div className={cn("p-1.5 rounded-md", variant.iconBg)}>
					{getStatusIcon(scan.status)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm truncate">
						{scan.attendeeName || "Unknown"}
					</p>
					{scan.attendeeEmail && (
						<p className="text-xs text-muted-foreground truncate">
							{scan.attendeeEmail}
						</p>
					)}
					{scan.ticketType && (
						<p className="text-xs text-muted-foreground">
							{scan.ticketType}
							{scan.ticketValue && ` • $${scan.ticketValue}`}
						</p>
					)}
				</div>
			</div>
			<p className="text-xs text-muted-foreground font-mono truncate">
				{scan.ticketId}
			</p>
			<p className="text-xs text-muted-foreground mt-1">
				{scan.timestamp.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})}
			</p>
		</div>
	);
}

