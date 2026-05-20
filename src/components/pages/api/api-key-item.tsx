"use client";

import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ApiKeyScope } from "@/lib/api/api-keys";
import { cn } from "@/lib/utils";
import { ApiKeyActionsMenu } from "./api-key-action-menu";
import type { BaseApiKey } from "./api-key-table-columns";

interface ApiKeyItemProps {
	apiKey: BaseApiKey;
}

const SCOPE_LABELS: Record<ApiKeyScope, string> = {
	read_only: "Read only",
	check_in: "Check-in",
	read_write: "Full access",
};

const SCOPE_BADGE_CLASS: Record<ApiKeyScope, string> = {
	read_only: "border-slate-500/40 text-slate-600",
	check_in: "border-blue-500/40 text-blue-600",
	read_write: "border-amber-500/40 text-amber-600",
};

// Format date with time
function formatDateTime(date: string | Date): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(dateObj.getTime())) return "Invalid Date";
	return dateObj.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Format relative time
function formatRelativeTime(date: string | Date): string {
	if (!date) return "Never";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(dateObj.getTime())) return "Invalid";

	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return dateObj.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export function ApiKeyItem({ apiKey }: ApiKeyItemProps) {
	return (
		<div className="flex items-center gap-3 border-b border-dashed bg-card p-3">
			{/* Main content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<h3 className="truncate font-medium">{apiKey.name}</h3>
					<Badge
						variant="outline"
						className={cn(
							"shrink-0 rounded-none px-1.5 py-0 font-semibold text-[10px]",
							apiKey.isActive
								? "border-green-500/30 text-green-600"
								: "border-red-500/30 text-red-500",
						)}
					>
						{apiKey.isActive ? "Active" : "Revoked"}
					</Badge>
					<Badge
						variant="outline"
						className={cn(
							"shrink-0 rounded-none px-1.5 py-0 font-semibold text-[10px]",
							SCOPE_BADGE_CLASS[apiKey.scope ?? "read_only"],
						)}
					>
						{SCOPE_LABELS[apiKey.scope ?? "read_only"]}
					</Badge>
				</div>

				<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
					<span className="flex items-center gap-1">
						<Clock className="size-3" />
						{apiKey.lastUsedAt
							? formatRelativeTime(apiKey.lastUsedAt)
							: "Never used"}
					</span>
					<span className="flex items-center gap-1">
						<Calendar className="size-3" />
						{formatDateTime(apiKey.createdAt)}
					</span>
				</div>
			</div>

			{/* Actions */}
			<ApiKeyActionsMenu apiKey={apiKey} />
		</div>
	);
}
