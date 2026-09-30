"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ISO_DATE, parseIsoDate } from "./filters";

/**
 * Click-to-pick date field. The value is a YYYY-MM-DD string ("" = no date),
 * so it drops straight into the API filters. `min` / `max` keep a from/to pair
 * in order.
 */
export function DatePickerField({
	id,
	value,
	onChange,
	placeholder = "Pick a date",
	min,
	max,
	className,
}: {
	id?: string;
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	min?: string;
	max?: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const selected = parseIsoDate(value);
	const minDate = parseIsoDate(min);
	const maxDate = parseIsoDate(max);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<div className="relative">
				<PopoverTrigger asChild>
					<Button
						id={id}
						type="button"
						variant="outline"
						className={cn(
							"h-9 w-44 justify-start rounded-none bg-background pr-8 font-normal",
							!selected && "text-muted-foreground",
							className,
						)}
					>
						<CalendarIcon className="size-4 shrink-0" />
						<span className="truncate">
							{selected ? format(selected, "MMM d, yyyy") : placeholder}
						</span>
					</Button>
				</PopoverTrigger>
				{selected && (
					<button
						type="button"
						aria-label="Clear date"
						className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						onClick={() => onChange("")}
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>
			<PopoverContent align="start" className="w-auto rounded-none p-0">
				<Calendar
					mode="single"
					selected={selected}
					defaultMonth={selected ?? maxDate ?? minDate}
					captionLayout="dropdown"
					startMonth={new Date(2015, 0)}
					endMonth={new Date(new Date().getFullYear() + 2, 11)}
					disabled={[
						...(minDate ? [{ before: minDate }] : []),
						...(maxDate ? [{ after: maxDate }] : []),
					]}
					onSelect={(date) => {
						onChange(date ? format(date, ISO_DATE) : "");
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
