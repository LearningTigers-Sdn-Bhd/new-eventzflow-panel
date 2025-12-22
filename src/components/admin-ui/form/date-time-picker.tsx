"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import { cn } from "@/lib/utils";

const buttonVariants = cva("", {
	variants: {
		variant: {
			rounded: "rounded-md",
			"no-rounded": "rounded-none",
		},
	},
	defaultVariants: {
		variant: "no-rounded",
	},
});

interface DateTimePickerProps {
	date?: Date;
	onDateChange: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
	variant?: VariantProps<typeof buttonVariants>["variant"];
}

interface DateTimePickerFieldProps {
	// Label props
	label: string;
	htmlFor?: string;

	// Variant
	variant?: VariantProps<typeof buttonVariants>["variant"];

	// Values & handlers
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Additional props
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;

	// Styling
	fieldClassName?: string;
}

function DateTimePicker({
	date,
	onDateChange,
	disabled,
	placeholder = "Pick a date and time",
	variant = "no-rounded",
}: DateTimePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		date,
	);

	// Convert 24h to 12h format for display
	const get12Hour = React.useCallback((date?: Date) => {
		if (!date) return "12";
		const hour = date.getHours();
		if (hour === 0) return "12";
		if (hour > 12) return (hour - 12).toString();
		return hour.toString();
	}, []);

	const getAMPM = React.useCallback((date?: Date) => {
		if (!date) return "AM";
		return date.getHours() >= 12 ? "PM" : "AM";
	}, []);

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
	}, [date, getAMPM, get12Hour]);

	const handleDateSelect = (newDate: Date | undefined) => {
		if (!newDate) {
			setSelectedDate(undefined);
			onDateChange(undefined);
			return;
		}

		// Convert 12h to 24h and preserve time when selecting new date
		let hour24 = Number.parseInt(hours, 10);
		if (period === "PM" && hour24 !== 12) {
			hour24 += 12;
		} else if (period === "AM" && hour24 === 12) {
			hour24 = 0;
		}

		newDate.setHours(hour24, Number.parseInt(minutes, 10), 0, 0);
		setSelectedDate(newDate);
		onDateChange(newDate);
	};

	const handleTimeChange = (
		newHours: string,
		newMinutes: string,
		newPeriod: "AM" | "PM",
	) => {
		setHours(newHours);
		setMinutes(newMinutes);
		setPeriod(newPeriod);

		if (selectedDate) {
			const newDate = new Date(selectedDate);

			// Convert 12h to 24h format
			let hour24 = Number.parseInt(newHours, 10);
			if (newPeriod === "PM" && hour24 !== 12) {
				hour24 += 12;
			} else if (newPeriod === "AM" && hour24 === 12) {
				hour24 = 0;
			}

			newDate.setHours(hour24, Number.parseInt(newMinutes, 10), 0, 0);
			setSelectedDate(newDate);
			onDateChange(newDate);
		}
	};

	// Generate hours (1-12 for 12h format)
	const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

	// Generate minutes (00-59)
	const minuteOptions = Array.from({ length: 60 }, (_, i) =>
		i.toString().padStart(2, "0"),
	);

	return (
		<ButtonGroup className={cn("w-full", buttonVariants({ variant }))}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"min-w-0 flex-1 justify-start py-6 text-left font-normal md:py-2",
							!selectedDate && "text-muted-foreground",
							buttonVariants({ variant }),
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
						<span className="truncate">
							{selectedDate ? format(selectedDate, "PPP") : placeholder}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className={cn("w-auto p-0", buttonVariants({ variant }))}
					align="start"
				>
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
							"w-[140px] shrink-0 justify-start py-6 font-normal md:py-2",
							!selectedDate && "text-muted-foreground",
							buttonVariants({ variant }),
						)}
						disabled={disabled || !selectedDate}
					>
						<Clock className="mr-2 h-4 w-4 shrink-0" />
						{hours}:{minutes} {period}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className={cn("w-[250px] p-3 md:w-auto", buttonVariants({ variant }))}
					align="end"
				>
					<div className="grid h-[80px] grid-cols-3 gap-1">
						<div className="flex flex-col gap-1">
							<div className="text-center font-mono text-muted-foreground text-xs">
								Hour
							</div>
							<Select
								value={hours}
								onValueChange={(value) =>
									handleTimeChange(value, minutes, period)
								}
								disabled={disabled}
							>
								<SelectTrigger
									className={cn(
										"w-full flex-1 flex-col items-center justify-center [&_svg]:hidden",
										buttonVariants({ variant }),
									)}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent
									className={cn("max-h-[200px]", buttonVariants({ variant }))}
								>
									{hourOptions.map((hour) => (
										<SelectItem
											key={hour}
											value={hour}
											className={buttonVariants({ variant })}
										>
											{hour}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<div className="text-center font-mono text-muted-foreground text-xs">
								Minute
							</div>
							<Select
								value={minutes}
								onValueChange={(value) =>
									handleTimeChange(hours, value, period)
								}
								disabled={disabled}
							>
								<SelectTrigger
									className={cn(
										"w-full flex-1 flex-col items-center justify-center [&_svg]:hidden",
										buttonVariants({ variant }),
									)}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent
									className={cn("max-h-[200px]", buttonVariants({ variant }))}
								>
									{minuteOptions.map((minute) => (
										<SelectItem
											key={minute}
											value={minute}
											className={buttonVariants({ variant })}
										>
											{minute}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<div className="text-center font-mono text-muted-foreground text-xs">
								Period
							</div>
							<Select
								value={period}
								onValueChange={(value: "AM" | "PM") =>
									handleTimeChange(hours, minutes, value)
								}
								disabled={disabled}
							>
								<SelectTrigger
									className={cn(
										"w-full flex-1 flex-col items-center justify-center [&_svg]:hidden",
										buttonVariants({ variant }),
									)}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent
									className={cn("max-h-[200px]", buttonVariants({ variant }))}
								>
									<SelectItem
										value="AM"
										className={buttonVariants({ variant })}
									>
										AM
									</SelectItem>
									<SelectItem
										value="PM"
										className={buttonVariants({ variant })}
									>
										PM
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</ButtonGroup>
	);
}

export default function DateTimePickerField({
	label,
	htmlFor,
	variant = "no-rounded",
	value,
	onChange,
	errors,
	isInvalid = false,
	placeholder,
	disabled,
	required,
	fieldClassName,
}: DateTimePickerFieldProps) {
	// Remove any existing asterisk from the label if present
	const cleanLabel = label.replace(/\s*\*\s*$/, "").trim();
	const showRequiredIndicator = required;

	return (
		<Field
			data-invalid={isInvalid}
			orientation="vertical"
			className={fieldClassName}
		>
			<FieldLabel htmlFor={htmlFor}>
				{cleanLabel}
				{showRequiredIndicator && (
					<span className="ml-0.5 text-destructive">*</span>
				)}
			</FieldLabel>
			<DateTimePicker
				date={value}
				onDateChange={onChange}
				disabled={disabled}
				placeholder={placeholder}
				variant={variant}
			/>
			{isInvalid && <FieldError errors={errors} />}
		</Field>
	);
}
