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
	| { type: "all_time" }
	| { type: "pre_event" }
	| { type: "event_duration" }
	| { type: "specific_date"; date: Date };

export interface EventDateFilterProps {
	eventStartDate: string; // ISO date string
	eventEndDate: string; // ISO date string
	value: EventDateSelection;
	onChange: (value: EventDateSelection) => void;
	className?: string;
	/** Hide the all_time option */
	hideAllTime?: boolean;
	/** Hide the pre-event option */
	hidePreEvent?: boolean;
}

export function EventDateFilter({
	eventStartDate,
	eventEndDate,
	value,
	onChange,
	className,
	hideAllTime = false,
	hidePreEvent = false,
}: EventDateFilterProps) {
	// Generate all dates between event start and end
	const eventDates = useMemo(() => {
		const start = parseISO(eventStartDate);
		const end = parseISO(eventEndDate);
		return eachDayOfInterval({ start, end });
	}, [eventStartDate, eventEndDate]);

	// Get display label
	const getLabel = () => {
		switch (value.type) {
			case "all_time":
				return "All Time";
			case "pre_event":
				return "Pre-Event";
			case "event_duration":
				return "Event Duration";
			case "specific_date":
				return format(value.date, "MMM d, yyyy");
		}
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
				{!hideAllTime && (
					<DropdownMenuItem
						onClick={() => onChange({ type: "all_time" })}
						className={`rounded-none ${value.type === "all_time" ? "bg-accent" : ""}`}
					>
						All Time
					</DropdownMenuItem>
				)}
				{!hidePreEvent && (
					<DropdownMenuItem
						onClick={() => onChange({ type: "pre_event" })}
						className={`rounded-none ${value.type === "pre_event" ? "bg-accent" : ""}`}
					>
						Pre-Event
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => onChange({ type: "event_duration" })}
					className={`rounded-none ${value.type === "event_duration" ? "bg-accent" : ""}`}
				>
					Event Duration
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
	dateMode?: "all_time" | "pre_event";
	groupBy: "hour" | "day";
} {
	switch (selection.type) {
		case "all_time":
			// Use date_mode param to let backend calculate full range
			return { dateMode: "all_time", groupBy: "day" };
		case "pre_event":
			// Use date_mode param to let backend calculate pre-event range
			return { dateMode: "pre_event", groupBy: "day" };
		case "event_duration":
			// Return undefined dates to let backend use event duration
			return { groupBy: "day" };
		case "specific_date":
			// For specific date, return that date with hourly grouping
			const dateStr = format(selection.date, "yyyy-MM-dd");
			return {
				startDate: dateStr,
				endDate: dateStr,
				groupBy: "hour",
			};
	}
}
