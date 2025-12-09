"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
	date?: Date;
	onDateChange: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function DateTimePicker({
	date,
	onDateChange,
	disabled,
	placeholder = "Pick a date and time",
}: DateTimePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);
	
	// Convert 24h to 12h format for display
	const get12Hour = (date?: Date) => {
		if (!date) return "12";
		const hour = date.getHours();
		if (hour === 0) return "12";
		if (hour > 12) return (hour - 12).toString();
		return hour.toString();
	};

	const getAMPM = (date?: Date) => {
		if (!date) return "AM";
		return date.getHours() >= 12 ? "PM" : "AM";
	};

	const [hours, setHours] = React.useState<string>(
		date ? get12Hour(date) : "12",
	);
	const [minutes, setMinutes] = React.useState<string>(
		date ? format(date, "mm") : "00",
	);
	const [period, setPeriod] = React.useState<"AM" | "PM">(
		date ? getAMPM(date) : "AM",
	);

	React.useEffect(() => {
		if (date) {
			setSelectedDate(date);
			setHours(get12Hour(date));
			setMinutes(format(date, "mm"));
			setPeriod(getAMPM(date));
		}
	}, [date]);

	const handleDateSelect = (newDate: Date | undefined) => {
		if (!newDate) {
			setSelectedDate(undefined);
			onDateChange(undefined);
			return;
		}

		// Convert 12h to 24h and preserve time when selecting new date
		let hour24 = Number.parseInt(hours);
		if (period === "PM" && hour24 !== 12) {
			hour24 += 12;
		} else if (period === "AM" && hour24 === 12) {
			hour24 = 0;
		}
		
		newDate.setHours(hour24, Number.parseInt(minutes), 0, 0);
		setSelectedDate(newDate);
		onDateChange(newDate);
	};

	const handleTimeChange = (newHours: string, newMinutes: string, newPeriod: "AM" | "PM") => {
		setHours(newHours);
		setMinutes(newMinutes);
		setPeriod(newPeriod);

		if (selectedDate) {
			const newDate = new Date(selectedDate);
			
			// Convert 12h to 24h format
			let hour24 = Number.parseInt(newHours);
			if (newPeriod === "PM" && hour24 !== 12) {
				hour24 += 12;
			} else if (newPeriod === "AM" && hour24 === 12) {
				hour24 = 0;
			}
			
			newDate.setHours(hour24, Number.parseInt(newMinutes), 0, 0);
			setSelectedDate(newDate);
			onDateChange(newDate);
		}
	};

	// Generate hours (1-12 for 12h format)
	const hourOptions = Array.from({ length: 12 }, (_, i) =>
		(i + 1).toString(),
	);

	// Generate minutes (00-59)
	const minuteOptions = Array.from({ length: 60 }, (_, i) =>
		i.toString().padStart(2, "0"),
	);

	return (
		<div className="flex w-full gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"min-w-0 flex-1 justify-start text-left font-normal",
							!selectedDate && "text-muted-foreground",
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
						<span className="truncate">
							{selectedDate ? (
								format(selectedDate, "PPP")
							) : (
								placeholder
							)}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDateSelect}
						initialFocus
						disabled={disabled}
					/>
				</PopoverContent>
			</Popover>

			{/* Time Selectors */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[140px] shrink-0 justify-start font-normal",
							!selectedDate && "text-muted-foreground",
						)}
						disabled={disabled || !selectedDate}
					>
						<Clock className="mr-2 h-4 w-4 shrink-0" />
						{hours}:{minutes} {period}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-3" align="end">
					<div className="flex items-center gap-2">
						<div className="flex flex-col gap-1">
							<label className="text-center text-muted-foreground text-xs">
								Hour
							</label>
							<Select
								value={hours}
								onValueChange={(value) => handleTimeChange(value, minutes, period)}
								disabled={disabled}
							>
								<SelectTrigger className="w-[70px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-[200px]">
									{hourOptions.map((hour) => (
										<SelectItem key={hour} value={hour}>
											{hour}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<span className="mt-6 font-bold">:</span>
						<div className="flex flex-col gap-1">
							<label className="text-center text-muted-foreground text-xs">
								Minute
							</label>
							<Select
								value={minutes}
								onValueChange={(value) => handleTimeChange(hours, value, period)}
								disabled={disabled}
							>
								<SelectTrigger className="w-[70px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-[200px]">
									{minuteOptions.map((minute) => (
										<SelectItem key={minute} value={minute}>
											{minute}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-center text-muted-foreground text-xs">
								Period
							</label>
							<Select
								value={period}
								onValueChange={(value: "AM" | "PM") => handleTimeChange(hours, minutes, value)}
								disabled={disabled}
							>
								<SelectTrigger className="w-[70px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="AM">AM</SelectItem>
									<SelectItem value="PM">PM</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

