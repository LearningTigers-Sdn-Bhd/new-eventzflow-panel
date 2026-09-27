"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VehicleIssue } from "@/lib/api/vehicle-registration";

interface VehicleIssuesBadgeProps {
	issues: VehicleIssue[];
}

export function VehicleIssuesBadge({ issues }: VehicleIssuesBadgeProps) {
	if (issues.length === 0) {
		return (
			<Badge
				variant="outline"
				className="h-6 gap-1 rounded-none border-green-200 bg-green-50 px-2 font-bold text-[10px] text-green-700 uppercase"
			>
				<CheckCircle2 className="size-3" />
				OK
			</Badge>
		);
	}

	return (
		<Badge
			variant="outline"
			className="h-6 gap-1 rounded-none border-amber-200 bg-amber-50 px-2 font-bold text-[10px] text-amber-700 uppercase"
			title={issues.map((i) => i.message).join("\n")}
		>
			<AlertTriangle className="size-3" />
			{issues.length} {issues.length === 1 ? "issue" : "issues"}
		</Badge>
	);
}
