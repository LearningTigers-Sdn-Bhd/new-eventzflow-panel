/**
 * Recent Scan Card Component
 * Displays a single recent scan result in compact format
 */

import { cn } from "@/lib/utils";
import { getStatusIcon, getStatusVariant } from "./status-helpers";
import type { ScanResult } from "./types";

interface RecentScanCardProps {
	scan: ScanResult;
}

export function RecentScanCard({ scan }: RecentScanCardProps) {
	const variant = getStatusVariant(scan.status);

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
						{scan.attendeeName || "Unknown"}
					</p>
					<p
						className={cn(
							"truncate text-xs",
							scan.attendeeEmail
								? "text-muted-foreground"
								: "text-muted-foreground/60 italic",
						)}
					>
						{scan.attendeeEmail || "No email"}
					</p>
					{scan.ticketType && (
						<p className="text-muted-foreground text-xs">
							{scan.ticketType}
							{scan.ticketValue && ` • $${scan.ticketValue}`}
						</p>
					)}
				</div>
			</div>
			<p className="truncate font-mono text-muted-foreground text-xs">
				{scan.ticketId}
			</p>
			<p className="mt-1 text-muted-foreground text-xs">
				{scan.timestamp.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})}
			</p>
		</div>
	);
}
