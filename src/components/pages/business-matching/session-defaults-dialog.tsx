"use client";

import { format, parseISO } from "date-fns";
import {
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	useBusinessMatchingEventDefaults,
	useUpdateBusinessMatchingEventDefaults,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { DefaultHoursBlock } from "@/lib/api/business-matching";
import { validEndTimes, validStartTimes } from "@/lib/time-blocks";
import { cn } from "@/lib/utils";

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
	const [blocks, setBlocks] = useState<DefaultHoursBlock[]>([]);
	const [hoursEditableDefault, setHoursEditableDefault] = useState(true);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);

	// Add-block flow: revealed blank, time chosen from a fixed list only.
	const [isAddingBlock, setIsAddingBlock] = useState(false);
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [startSelectOpen, setStartSelectOpen] = useState(false);
	const [endSelectOpen, setEndSelectOpen] = useState(false);

	useEffect(() => {
		if (defaults) {
			setStartDate(defaults.default_start_date || "");
			setEndDate(defaults.default_end_date || "");
			setSlotDuration(defaults.default_slot_duration || 30);
			setBlocks(defaults.default_hours);
			setHoursEditableDefault(defaults.hours_editable_default);
		}
	}, [defaults]);

	const handleStartDateSelect = (date: Date | undefined) => {
		if (!date) return;
		setStartDate(format(date, "yyyy-MM-dd"));
		setStartDateOpen(false);
		// Jump straight to picking the end date next.
		setEndDateOpen(true);
	};

	const handleEndDateSelect = (date: Date | undefined) => {
		if (!date) return;
		setEndDate(format(date, "yyyy-MM-dd"));
		setEndDateOpen(false);
	};

	const startAddingBlock = () => {
		setNewStart("");
		setNewEnd("");
		setIsAddingBlock(true);
		setStartSelectOpen(true);
	};

	const handleNewStartChange = (value: string) => {
		setNewStart(value);
		setNewEnd("");
		setStartSelectOpen(false);
		// Move straight to picking the end time next.
		setEndSelectOpen(true);
	};

	const handleConfirmBlock = () => {
		if (!newStart || !newEnd) return;
		setBlocks((prev) =>
			[...prev, { start_time: newStart, end_time: newEnd }].sort((a, b) =>
				a.start_time.localeCompare(b.start_time),
			),
		);
		setIsAddingBlock(false);
		setNewStart("");
		setNewEnd("");
	};

	const handleRemoveBlock = (index: number) => {
		setBlocks((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = () => {
		if (blocks.length === 0) {
			toast.error("Add at least one working-hours block.");
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
				default_hours: blocks,
				hours_editable_default: hoursEditableDefault,
				default_slot_duration: slotDuration,
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

	const startTimeOptions = validStartTimes(blocks);
	const endTimeOptions = newStart ? validEndTimes(blocks, newStart) : [];

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
								disabled={isPending}
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
					Gaps between blocks act as breaks (e.g. lunch).
				</p>
				<div className="space-y-2">
					{blocks.map((block, index) => (
						<div
							key={`${block.start_time}-${block.end_time}-${index}`}
							className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary text-xs"
						>
							<span>
								{block.start_time} - {block.end_time}
							</span>
							<button
								type="button"
								onClick={() => handleRemoveBlock(index)}
								disabled={isPending}
								className="font-bold text-primary transition hover:text-red-500"
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>

				{isAddingBlock ? (
					<div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
						<Select
							open={startSelectOpen}
							onOpenChange={setStartSelectOpen}
							value={newStart}
							onValueChange={handleNewStartChange}
							disabled={isPending}
						>
							<SelectTrigger className="h-8 w-28 text-xs">
								<SelectValue placeholder="Start time" />
							</SelectTrigger>
							<SelectContent className="max-h-[240px]">
								{startTimeOptions.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="text-muted-foreground text-xs">to</span>
						<Select
							open={endSelectOpen}
							onOpenChange={setEndSelectOpen}
							value={newEnd}
							onValueChange={setNewEnd}
							disabled={isPending || !newStart}
						>
							<SelectTrigger className="h-8 w-28 text-xs">
								<SelectValue placeholder="End time" />
							</SelectTrigger>
							<SelectContent className="max-h-[240px]">
								{endTimeOptions.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							size="icon"
							className="h-8 w-8"
							onClick={handleConfirmBlock}
							disabled={isPending || !newStart || !newEnd}
						>
							<Check className="h-3.5 w-3.5" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setIsAddingBlock(false)}
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
						onClick={startAddingBlock}
						disabled={isPending || startTimeOptions.length === 0}
						className="gap-1"
					>
						<Plus className="h-3 w-3" /> Add Block
					</Button>
				)}
			</div>

			<div className="flex items-center justify-between rounded-lg border p-3">
				<div className="space-y-0.5">
					<Label htmlFor="hours-editable-default">
						Hosts can edit their own hours by default
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
