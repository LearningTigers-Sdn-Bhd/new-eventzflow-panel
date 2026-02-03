/**
 * Status Helper Functions
 * Shared utilities for rendering scan status indicators
 */

import { AlertCircle, CalendarX, CheckCircle2, Ticket, UserRound, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { STATUS_VARIANTS } from "./constants";
import type { ScanStatus } from "./types";
import type { ScanType } from "@/lib/api/scan";

// Type variants for Ticket/Visitor badges
const TYPE_VARIANTS = {
	ticket: {
		badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
		text: "text-blue-600",
		label: "Ticket",
	},
	visitor: {
		badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
		text: "text-purple-600",
		label: "Visitor",
	},
} as const;

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
		case "wrong_day":
			return (
				<CalendarX
					className={cn(combinedClassName, STATUS_VARIANTS.wrong_day.text)}
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

/**
 * Get type icon component based on scan type
 */
export function getTypeIcon(type: ScanType, role?: string | null, className?: string) {
	const defaultClassName = "h-4 w-4";
	const combinedClassName = cn(defaultClassName, className);

	// If it has a role, use UserRound as it's more generic for dynamic roles
	if (role) {
		return (
			<UserRound
				className={cn(combinedClassName, type === 'ticket' ? TYPE_VARIANTS.ticket.text : TYPE_VARIANTS.visitor.text)}
			/>
		);
	}

	switch (type) {
		case "ticket":
			return (
				<Ticket
					className={cn(combinedClassName, TYPE_VARIANTS.ticket.text)}
				/>
			);
		case "visitor":
			return (
				<UserRound
					className={cn(combinedClassName, TYPE_VARIANTS.visitor.text)}
				/>
			);
	}
}

/**
 * Render a type badge (Ticket/Visitor)
 */
interface TypeBadgeProps {
	type: ScanType;
	role?: string | null;
	className?: string;
}

export function TypeBadge({ type, role, className }: TypeBadgeProps) {
	const variant = TYPE_VARIANTS[type];
	const label = role || variant.label;

	return (
		<Badge
			variant="outline"
			className={cn(
				"gap-1 px-1.5 py-0.5 text-[10px] sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs",
				variant.badgeBg,
				className,
			)}
		>
			{getTypeIcon(type, role)}
			<span>{label}</span>
		</Badge>
	);
}
