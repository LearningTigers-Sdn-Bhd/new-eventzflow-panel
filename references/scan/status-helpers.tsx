/**
 * Status Helper Functions
 * Shared utilities for rendering scan status indicators
 */

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScanStatus } from "./types";
import { STATUS_VARIANTS } from "./constants";

/**
 * Get status icon component based on scan status
 */
export function getStatusIcon(status: ScanStatus, className?: string) {
	const defaultClassName = "h-4 w-4";
	const combinedClassName = cn(defaultClassName, className);

	switch (status) {
		case "success":
			return <CheckCircle2 className={cn(combinedClassName, STATUS_VARIANTS.success.text)} />;
		case "error":
			return <XCircle className={cn(combinedClassName, STATUS_VARIANTS.error.text)} />;
		case "duplicate":
			return <AlertCircle className={cn(combinedClassName, STATUS_VARIANTS.duplicate.text)} />;
	}
}

/**
 * Get status variant configuration
 */
export function getStatusVariant(status: ScanStatus) {
	return STATUS_VARIANTS[status];
}

/**
 * Render a status badge with icon and message
 */
interface StatusBadgeProps {
	status: ScanStatus;
	message: string;
	showFullMessage?: boolean;
	className?: string;
}

export function StatusBadge({ status, message, showFullMessage = true, className }: StatusBadgeProps) {
	const variant = getStatusVariant(status);
	const label = variant.label;

	return (
		<Badge variant="outline" className={cn("gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1", variant.badgeBg, className)}>
			{getStatusIcon(status)}
			{showFullMessage ? (
				<>
					<span className="hidden sm:inline">{message}</span>
					<span className="inline sm:hidden truncate max-w-[80px]">{label}</span>
				</>
			) : (
				<span>{label}</span>
			)}
		</Badge>
	);
}
