import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ReportSectionProps {
	icon: LucideIcon;
	title: string;
	action?: ReactNode;
	children: ReactNode;
}

/**
 * Bordered, rounded-none section box matching the "Quick Actions" panel
 * pattern (icon + label header row, dashed content padding) used on the
 * event details page — the system's shared dashboard-section chrome.
 */
export function ReportSection({
	icon: Icon,
	title,
	action,
	children,
}: ReportSectionProps) {
	return (
		<div className="border bg-background">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Icon className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">{title}</span>
				</div>
				{action}
			</div>
			<div className="p-3">{children}</div>
		</div>
	);
}
