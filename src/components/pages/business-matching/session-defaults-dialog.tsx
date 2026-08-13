"use client";

import { format, parseISO } from "date-fns";
import {
	AlertTriangle,
	Calendar as CalendarIcon,
	Check,
	Loader2,
	Plus,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
	useBusinessMatchingEventDefaults,
	useUpdateBusinessMatchingEventDefaults,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { DefaultHoursBlock } from "@/lib/api/business-matching";
import { validEndTimes, validStartTimes } from "@/lib/time-blocks";
import { cn } from "@/lib/utils";
import { TimeSelect } from "./time-select";

interface SessionDefaultsDialogProps {
	eventId: string;
}

export default function SessionDefaultsDialog({
	eventId,
}: SessionDefaultsDialogProps) {
	const { closeDialog } = useDialog();
	const { data: defaults, isLoading } =
		useBusinessMatchingEventDefaults(eventId);
	const { mutate: updateDefaults, isPending } =
		useUpdateBusinessMatchingEventDefaults(eventId);

	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [slotDuration, setSlotDuration] = useState(30);
	const [sessions, setSessions] = useState<DefaultHoursBlock[]>([]);
	const [hoursEditableDefault, setHoursEditableDefault] = useState(true);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);
	const [publicBookingEnabled, setPublicBookingEnabled] = useState(true);
	const [publicBookingCutoffDate, setPublicBookingCutoffDate] = useState("");
	const [cutoffDateOpen, setCutoffDateOpen] = useState(false);

	// Add-session flow: revealed blank, time chosen from a fixed list only.
	const [isAddingSession, setIsAddingSession] = useState(false);
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [startSelectOpen, setStartSelectOpen] = useState(false);
	const [endSelectOpen, setEndSelectOpen] = useState(false);

	useEffect(() => {
		if (defaults) {
			setStartDate(defaults.default_start_date || "");
			setEndDate(defaults.default_end_date || "");
			setSlotDuration(defaults.default_slot_duration || 30);
			setSessions(defaults.default_hours);
			setHoursEditableDefault(defaults.hours_editable_default);
			setPublicBookingEnabled(defaults.public_booking_enabled);
			setPublicBookingCutoffDate(defaults.public_booking_cutoff_date || "");
		}
	}, [defaults]);

	const handleCutoffDateSelect = (date: Date | undefined) => {
		setPublicBookingCutoffDate(date ? format(date, "yyyy-MM-dd") : "");
		setCutoffDateOpen(false);
	};

	// Enabled, but the picked/loaded cutoff date has already passed — warn
	// before it's even saved, not just after.
	const pastCutoffWarning =
		publicBookingEnabled &&
		!!publicBookingCutoffDate &&
		publicBookingCutoffDate < format(new Date(), "yyyy-MM-dd");

	const handleStartDateSelect = (date: Date | undefined) => {
		if (!date) return;
		const newStartDate = format(date, "yyyy-MM-dd");
		setStartDate(newStartDate);
		// The previously-picked end date may now be before the new start —
		// clear it rather than leave a now-invalid date sitting in the field.
		if (endDate && endDate < newStartDate) {
			setEndDate("");
		}
		setStartDateOpen(false);
		// Jump straight to picking the end date next.
		setEndDateOpen(true);
	};

	const handleEndDateSelect = (date: Date | undefined) => {
		if (!date) return;
		setEndDate(format(date, "yyyy-MM-dd"));
		setEndDateOpen(false);
	};

	const startAddingSession = () => {
		setNewStart("");
		setNewEnd("");
		setIsAddingSession(true);
		setStartSelectOpen(true);
	};

	const handleNewStartChange = (value: string) => {
		setNewStart(value);
		setNewEnd("");
		setStartSelectOpen(false);
		// Move straight to picking the end time next.
		setEndSelectOpen(true);
	};

	const handleConfirmSession = () => {
		if (!newStart || !newEnd) return;
		setSessions((prev) =>
			[...prev, { start_time: newStart, end_time: newEnd }].sort((a, b) =>
				a.start_time.localeCompare(b.start_time),
			),
		);
		setIsAddingSession(false);
		setNewStart("");
		setNewEnd("");
	};

	const handleRemoveSession = (index: number) => {
		setSessions((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = () => {
		if (sessions.length === 0) {
			toast.error("Add at least one working-hours session.");
			return;
		}
		if (startDate && endDate && endDate < startDate) {
			toast.error("End date must be on or after the start date.");
			return;
		}
		updateDefaults(
			{
				default_start_date: startDate || null,
				default_end_date: endDate || null,
				default_hours: sessions,
				hours_editable_default: hoursEditableDefault,
				default_slot_duration: slotDuration,
				public_booking_enabled: publicBookingEnabled,
				public_booking_cutoff_date: publicBookingCutoffDate || null,
			},
			{
				onSuccess: () => {
					toast.success("Session defaults saved!");
					closeDialog();
				},
				onError: (error) =>
					toast.error("Failed to save session defaults", {
						description: error.message || "An unexpected error occurred.",
					}),
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const startTimeOptions = validStartTimes(sessions);
	const endTimeOptions = newStart ? validEndTimes(sessions, newStart) : [];

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="defaults-start-date">Default Start Date</Label>
					<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
						<PopoverTrigger asChild>
							<Button
								id="defaults-start-date"
								type="button"
								variant="outline"
								disabled={isPending}
								className={cn(
									"w-full justify-start font-normal",
									!startDate && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
								{startDate ? format(parseISO(startDate), "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={startDate ? parseISO(startDate) : undefined}
								onSelect={handleStartDateSelect}
								disabled={isPending}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-2">
					<Label htmlFor="defaults-end-date">Default End Date</Label>
					<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
						<PopoverTrigger asChild>
							<Button
								id="defaults-end-date"
								type="button"
								variant="outline"
								disabled={isPending}
								className={cn(
									"w-full justify-start font-normal",
									!endDate && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
								{endDate ? format(parseISO(endDate), "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={endDate ? parseISO(endDate) : undefined}
								onSelect={handleEndDateSelect}
								disabled={(date) =>
									isPending || (!!startDate && date < parseISO(startDate))
								}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="defaults-slot-duration">
					Default Slot Duration (minutes)
				</Label>
				<Input
					id="defaults-slot-duration"
					type="number"
					min={5}
					max={180}
					value={slotDuration}
					onChange={(e) => setSlotDuration(Number(e.target.value))}
					disabled={isPending}
					className="w-32"
				/>
			</div>

			<div className="space-y-2">
				<Label className="font-semibold text-sm">Default Matching Hours</Label>
				<p className="text-muted-foreground text-xs">
					Gaps between sessions act as breaks (e.g. lunch).
				</p>
				<div className="space-y-2">
					{sessions.map((session, index) => (
						<div
							key={`${session.start_time}-${session.end_time}-${index}`}
							className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary text-xs"
						>
							<span>
								{session.start_time} - {session.end_time}
							</span>
							<button
								type="button"
								onClick={() => handleRemoveSession(index)}
								disabled={isPending}
								className="font-bold text-primary transition hover:text-red-500"
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>

				{isAddingSession ? (
					<div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
						<TimeSelect
							options={startTimeOptions}
							open={startSelectOpen}
							onOpenChange={setStartSelectOpen}
							value={newStart}
							onValueChange={handleNewStartChange}
							disabled={isPending}
							placeholder="Start time"
						/>
						<span className="text-muted-foreground text-xs">to</span>
						<TimeSelect
							options={endTimeOptions}
							open={endSelectOpen}
							onOpenChange={setEndSelectOpen}
							value={newEnd}
							onValueChange={setNewEnd}
							disabled={isPending || !newStart}
							placeholder="End time"
						/>
						<Button
							type="button"
							size="icon"
							className="h-8 w-8"
							onClick={handleConfirmSession}
							disabled={isPending || !newStart || !newEnd}
						>
							<Check className="h-3.5 w-3.5" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setIsAddingSession(false)}
							disabled={isPending}
						>
							<X className="h-3.5 w-3.5" />
						</Button>
					</div>
				) : (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={startAddingSession}
						disabled={isPending || startTimeOptions.length === 0}
						className="gap-1"
					>
						<Plus className="h-3 w-3" /> Add Session
					</Button>
				)}
			</div>

			<div className="flex items-center justify-between rounded-lg border p-3">
				<div className="space-y-0.5">
					<Label htmlFor="hours-editable-default">
						Hosts can edit their own hours
					</Label>
				</div>
				<Switch
					id="hours-editable-default"
					checked={hoursEditableDefault}
					onCheckedChange={setHoursEditableDefault}
					disabled={isPending}
					className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
				/>
			</div>

			<div className="space-y-3 rounded-lg border p-3">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="public-booking-enabled">Allow public booking</Label>
						<p className="text-muted-foreground text-xs">
							Turn off to stop new bookings via the public link — staff can
							still add bookings directly either way.
						</p>
					</div>
					<Switch
						id="public-booking-enabled"
						checked={publicBookingEnabled}
						onCheckedChange={setPublicBookingEnabled}
						disabled={isPending}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="public-booking-cutoff-date">
						Cut-off date (optional)
					</Label>
					<Popover open={cutoffDateOpen} onOpenChange={setCutoffDateOpen}>
						<PopoverTrigger asChild>
							<Button
								id="public-booking-cutoff-date"
								type="button"
								variant="outline"
								disabled={isPending}
								className={cn(
									"w-full justify-start font-normal",
									!publicBookingCutoffDate && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
								{publicBookingCutoffDate
									? format(parseISO(publicBookingCutoffDate), "PPP")
									: "No cut-off — stays open indefinitely"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={
									publicBookingCutoffDate
										? parseISO(publicBookingCutoffDate)
										: undefined
								}
								onSelect={handleCutoffDateSelect}
								disabled={isPending}
							/>
							{publicBookingCutoffDate && (
								<div className="border-t p-2">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="w-full text-xs"
										onClick={() => {
											setPublicBookingCutoffDate("");
											setCutoffDateOpen(false);
										}}
									>
										Clear cut-off date
									</Button>
								</div>
							)}
						</PopoverContent>
					</Popover>
					<p className="text-muted-foreground text-xs">
						Public booking automatically closes the day after this date.
					</p>
				</div>

				{pastCutoffWarning && (
					<div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2.5 text-xs text-yellow-800 dark:text-yellow-200">
						<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
						<span>
							This cut-off date has already passed, but public booking is still
							enabled — the public can still book. Toggle it off if that's not
							intended.
						</span>
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="button" onClick={handleSave} disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Defaults
				</Button>
			</div>
		</div>
	);
}
