"use client";

import { format, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type EventDateSelection =
	| { type: "full_duration" }
	| { type: "specific_date"; date: Date };

export interface EventDateFilterProps {
	eventStartDate: string; // ISO date string
	eventEndDate: string; // ISO date string
	value: EventDateSelection;
	onChange: (value: EventDateSelection) => void;
	className?: string;
}

export function EventDateFilter({
	eventStartDate,
	eventEndDate,
	value,
	onChange,
	className,
}: EventDateFilterProps) {
	// Generate all dates between event start and end
	const eventDates = useMemo(() => {
		const start = parseISO(eventStartDate);
		const end = parseISO(eventEndDate);
		return eachDayOfInterval({ start, end });
	}, [eventStartDate, eventEndDate]);

	// Get display label
	const getLabel = () => {
		if (value.type === "full_duration") {
			return "Full Duration";
		}
		return format(value.date, "MMM d, yyyy");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className={`rounded-none ${className}`}>
					<Calendar className="mr-2 h-4 w-4" />
					{getLabel()}
					<ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto rounded-none">
				<DropdownMenuItem
					onClick={() => onChange({ type: "full_duration" })}
					className={`rounded-none ${value.type === "full_duration" ? "bg-accent" : ""}`}
				>
					Full Duration
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{eventDates.map((date, index) => (
					<DropdownMenuItem
						key={date.toISOString()}
						onClick={() => onChange({ type: "specific_date", date })}
						className={`rounded-none ${
							value.type === "specific_date" && isSameDay(value.date, date)
								? "bg-accent"
								: ""
						}`}
					>
						Day {index + 1} - {format(date, "MMM d, yyyy")}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Get API parameters from the filter selection
 */
export function getAnalyticsParamsFromSelection(
	selection: EventDateSelection,
): {
	startDate?: string;
	endDate?: string;
	groupBy: "hour" | "day";
} {
	if (selection.type === "full_duration") {
		// Return undefined dates to let backend use event duration
		// Use "day" grouping for full duration view
		return { groupBy: "day" };
	}

	// For specific date, return that date with hourly grouping
	const dateStr = format(selection.date, "yyyy-MM-dd");
	return {
		startDate: dateStr,
		endDate: dateStr,
		groupBy: "hour",
	};
}
