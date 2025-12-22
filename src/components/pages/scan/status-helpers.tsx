/**
 * Status Helper Functions
 * Shared utilities for rendering scan status indicators
 */

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { STATUS_VARIANTS } from "./constants";
import type { ScanStatus } from "./types";

/**
 * Get status icon component based on scan status
 */
export function getStatusIcon(status: ScanStatus, className?: string) {
	const defaultClassName = "h-4 w-4";
	const combinedClassName = cn(defaultClassName, className);

	switch (status) {
		case "success":
			return (
				<CheckCircle2
					className={cn(combinedClassName, STATUS_VARIANTS.success.text)}
				/>
			);
		case "error":
			return (
				<XCircle
					className={cn(combinedClassName, STATUS_VARIANTS.error.text)}
				/>
			);
		case "duplicate":
			return (
				<AlertCircle
					className={cn(combinedClassName, STATUS_VARIANTS.duplicate.text)}
				/>
			);
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
	className?: string;
}

export function StatusBadge({ status, message, className }: StatusBadgeProps) {
	const variant = getStatusVariant(status);
	const label = variant.label;

	// Extract the part after " - " from the message for the tooltip
	// If message is "Valid ticket - Checked in successfully", tooltip shows "Checked in successfully"
	const tooltipMessage = message.includes(" - ")
		? message.split(" - ").slice(1).join(" - ")
		: message;

	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Badge
					variant="outline"
					className={cn(
						"gap-1 px-1.5 py-0.5 text-[10px] sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs",
						variant.badgeBg,
						className,
					)}
				>
					{getStatusIcon(status)}
					<span>{label}</span>
				</Badge>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltipMessage}</p>
			</TooltipContent>
		</Tooltip>
	);
}
