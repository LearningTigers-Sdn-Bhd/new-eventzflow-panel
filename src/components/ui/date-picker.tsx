"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	date?: Date | null;
	onDateChange: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
	minDate?: Date;
	maxDate?: Date;
}

export function DatePicker({
	date,
	onDateChange,
	disabled,
	placeholder = "Pick a date",
	minDate,
	maxDate,
}: DatePickerProps) {
	const selectedDate = date ?? undefined;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start rounded-none text-left font-normal",
						!selectedDate && "text-muted-foreground",
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
					<span className="truncate">
						{selectedDate ? format(selectedDate, "PPP") : placeholder}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto rounded-none p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={onDateChange}
					disabled={(date) => {
						if (minDate && date < minDate) return true;
						if (maxDate && date > maxDate) return true;
						return false;
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
