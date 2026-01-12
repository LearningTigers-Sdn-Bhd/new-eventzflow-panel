"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TimeRangePreset = "today" | "last_7_days" | "last_30_days" | "event_duration";

export interface TimeRangeOption {
	value: TimeRangePreset;
	label: string;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
	{ value: "today", label: "Today" },
	{ value: "last_7_days", label: "Last 7 Days" },
	{ value: "last_30_days", label: "Last 30 Days" },
	{ value: "event_duration", label: "Event Duration" },
];

interface TimeRangeFilterProps {
	value: TimeRangePreset;
	onChange: (value: TimeRangePreset) => void;
	className?: string;
}

export function TimeRangeFilter({ value, onChange, className }: TimeRangeFilterProps) {
	const selectedOption = TIME_RANGE_OPTIONS.find((opt) => opt.value === value);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className={className}>
					<Calendar className="mr-2 h-4 w-4" />
					{selectedOption?.label || "Select Range"}
					<ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{TIME_RANGE_OPTIONS.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className={value === option.value ? "bg-accent" : ""}
					>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Calculate date range based on preset
 * Returns undefined for event_duration to let backend use event dates
 */
export function getDateRangeFromPreset(
	preset: TimeRangePreset,
): { startDate: string; endDate: string } | undefined {
	const today = new Date();
	const formatDate = (date: Date) => date.toISOString().split("T")[0];

	switch (preset) {
		case "today":
			return {
				startDate: formatDate(today),
				endDate: formatDate(today),
			};
		case "last_7_days": {
			const sevenDaysAgo = new Date(today);
			sevenDaysAgo.setDate(today.getDate() - 6);
			return {
				startDate: formatDate(sevenDaysAgo),
				endDate: formatDate(today),
			};
		}
		case "last_30_days": {
			const thirtyDaysAgo = new Date(today);
			thirtyDaysAgo.setDate(today.getDate() - 29);
			return {
				startDate: formatDate(thirtyDaysAgo),
				endDate: formatDate(today),
			};
		}
		case "event_duration":
		default:
			// Return undefined to let backend use event's start_date/end_date
			return undefined;
	}
}

export type GroupByOption = "hour" | "day" | "week" | "month";

/**
 * Get appropriate group_by based on date range
 * Returns undefined for event_duration to let backend auto-detect
 */
export function getGroupByFromPreset(preset: TimeRangePreset): GroupByOption | undefined {
	switch (preset) {
		case "today":
			return "hour";
		case "last_7_days":
			return "day";
		case "last_30_days":
			return "day";
		case "event_duration":
		default:
			// Return undefined to let backend auto-detect based on event duration
			return undefined;
	}
}
