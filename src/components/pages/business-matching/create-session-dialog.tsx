import { format, parseISO } from "date-fns";
import {
	AlertTriangle,
	Archive,
	ArchiveRestore,
	Calendar as CalendarIcon,
	Loader2,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useBusinessMatchingBookings,
	useCreateBusinessMatchingSession,
	useDeleteBusinessMatchingSession,
	useSessionAvailabilities,
	useUpdateBusinessMatchingSession,
} from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type {
	BusinessMatchingEvent,
	BusinessMatchingEventDefaults,
} from "@/lib/api/business-matching";
import { addMinutesToTime, TIME_OPTIONS } from "@/lib/time-blocks";
import { cn } from "@/lib/utils";
import ArchiveSessionDialog, {
	RestoreSessionDialog,
} from "./archive-session-dialog";
import ManageAvailabilityHours from "./manage-availability-hours";
import { TimeSelect } from "./time-select";

interface CreateSessionDialogProps {
	eventId: string;
	session?: BusinessMatchingEvent; // If provided, edit mode
	eventStartDate?: string; // Prefill only — the session's range can differ from the event's
	eventEndDate?: string;
	// This event's configured Business Matching defaults (date range, hours
	// template) — prefills a brand-new session so the admin doesn't have to
	// re-enter the same date/time every time.
	eventDefaults?: BusinessMatchingEventDefaults;
	// When true, this is a host editing their own session: the date range is
	// admin-controlled and read-only, and the host can't delete the session.
	isHostEditing?: boolean;
}

function FormSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
			<div>
				<h4 className="font-semibold text-sm">{title}</h4>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</div>
			{children}
		</section>
	);
}

function PermissionRow({
	id,
	title,
	description,
	checked,
	onCheckedChange,
	disabled,
}: {
	id: string;
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-4 border bg-muted/20 p-3">
			<div className="space-y-0.5">
				<Label htmlFor={id}>{title}</Label>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
				className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
			/>
		</div>
	);
}

const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
	eventId,
	session,
	eventStartDate,
	eventEndDate,
	eventDefaults,
	isHostEditing = false,
}) => {
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const isEditMode = !!session;
	const { mutate: createSession, isPending: isCreating } =
		useCreateBusinessMatchingSession(eventId);
	const { mutate: updateSession, isPending: isUpdating } =
		useUpdateBusinessMatchingSession(eventId);
	const { mutate: deleteSession, isPending: isDeleting } =
		useDeleteBusinessMatchingSession(eventId);

	// Existing bookings/availability blocks that a narrower Daily Start/End
	// Time would silently orphan — checked live so the conflict shows before
	// Save, not as a surprise afterward.
	const { data: bookingsData } = useBusinessMatchingBookings(
		session?.id ?? null,
		isEditMode ? eventId : null,
	);
	const { data: availabilities } = useSessionAvailabilities(session?.id ?? "");

	const isPending = isCreating || isUpdating || isDeleting;

	// Whether the current viewer may change the Daily Start/End Time and
	// working-hours breakdown: admins always can; a host can only if this
	// session's "Hosts can edit their own hours" toggle allows it.
	const canEditHours = isHostEditing ? (session?.hours_editable ?? true) : true;

	const hasHost = !!session?.host;
	const bookingsCount = session?.bookings_count ?? 0;
	const canArchive = !hasHost && bookingsCount === 0;
	const isArchived = session?.is_archived ?? !!session?.archived_at;

	const handleDelete = () => {
		if (!session) return;
		openConfirm({
			message: `Are you sure you want to delete session "${session.title}"? This cannot be undone.`,
			confirmLabel: "Yes, Delete Session",
			variant: "destructive",
			icon: "alert",
			onConfirm: () => {
				deleteSession(session.id, {
					onSuccess: () => {
						toast.success("Session deleted successfully!");
						closeDialog();
					},
					onError: (error) => {
						toast.error("Failed to delete session", {
							description: error.message || "An unexpected error occurred.",
						});
					},
				});
			},
		});
	};

	const handleArchive = () => {
		if (!session) return;
		openDialog({
			component: ArchiveSessionDialog,
			props: { session },
			config: {
				title: canArchive ? "Archive Session" : "Cannot Archive Session",
				size: "md",
				className: "rounded-none",
			},
		});
	};

	const handleUnarchive = () => {
		if (!session) return;
		openDialog({
			component: RestoreSessionDialog,
			props: { session },
			config: {
				title: "Restore Session",
				size: "md",
				className: "rounded-none",
			},
		});
	};

	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState(30);
	const [location, setLocation] = useState("");
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("17:00");
	const [startDate, setStartDate] = useState(
		eventStartDate?.slice(0, 10) || "",
	);
	const [endDate, setEndDate] = useState(eventEndDate?.slice(0, 10) || "");
	const [tagsEditable, setTagsEditable] = useState(true);
	const [hoursEditable, setHoursEditable] = useState(true);
	const [startTimeOpen, setStartTimeOpen] = useState(false);
	const [endTimeOpen, setEndTimeOpen] = useState(false);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);

	const handleStartTimeChange = (value: string) => {
		// Only auto-advance to the end time when this change came from the
		// user actually picking out of the open dropdown. On dialog load the
		// start time is prefilled (default, or the event's configured hours),
		// and that must not pop the end-time picker open by itself.
		const pickedFromOpenDropdown = startTimeOpen;

		setStartTime(value);
		setStartTimeOpen(false);
		if (pickedFromOpenDropdown) {
			setEndTimeOpen(true);
		}
	};

	const handleStartDatePick = (date: Date | undefined) => {
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

	const handleEndDatePick = (date: Date | undefined) => {
		if (!date) return;
		setEndDate(format(date, "yyyy-MM-dd"));
		setEndDateOpen(false);
	};

	useEffect(() => {
		if (session) {
			setTitle(session.title || "");
			setDuration(Number(session.duration) || 30);
			setLocation(session.location || "");
			setStartDate(session.start_date?.slice(0, 10) || "");
			setEndDate(session.end_date?.slice(0, 10) || "");
			setTagsEditable(session.tags_editable ?? true);
			setHoursEditable(session.hours_editable ?? true);
			setStartTime(session.start_time || "09:00");
			setEndTime(session.end_time || "17:00");
		}
	}, [session]);

	// New session (not editing an existing one): prefill from this event's
	// configured defaults once they've loaded.
	useEffect(() => {
		if (session || !eventDefaults) return;
		if (eventDefaults.default_start_date) {
			setStartDate(eventDefaults.default_start_date);
		}
		if (eventDefaults.default_end_date) {
			setEndDate(eventDefaults.default_end_date);
		}
		if (eventDefaults.default_hours.length > 0) {
			setStartTime(eventDefaults.default_hours[0].start_time);
			setEndTime(
				eventDefaults.default_hours[eventDefaults.default_hours.length - 1]
					.end_time,
			);
		}
		if (eventDefaults.default_slot_duration) {
			setDuration(eventDefaults.default_slot_duration);
		}
		setHoursEditable(eventDefaults.hours_editable_default);
	}, [session, eventDefaults]);

	// Bookings/blocks that would fall outside the currently-entered Daily
	// Start/End Time — recomputed live as the admin types, so the conflict
	// is visible before they ever hit Save.
	const timeConflicts = useMemo(() => {
		if (!isEditMode) return { bookings: [], blocks: [] };

		const conflictingBookings = (bookingsData?.bookings ?? []).filter((b) => {
			if (b.status === "Cancelled") return false;
			const bookingEnd = addMinutesToTime(
				b.booking_time,
				Number.parseInt(b.duration, 10) || 0,
			);
			return b.booking_time < startTime || bookingEnd > endTime;
		});

		const conflictingBlocks = (availabilities ?? []).filter(
			(a) => a.start_time < startTime || a.end_time > endTime,
		);

		return { bookings: conflictingBookings, blocks: conflictingBlocks };
	}, [isEditMode, bookingsData, availabilities, startTime, endTime]);

	const hasTimeConflict =
		timeConflicts.bookings.length > 0 || timeConflicts.blocks.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Session Title is required.");
			return;
		}
		if (startDate && endDate && endDate < startDate) {
			toast.error("End date must be on or after the start date.");
			return;
		}

		const payload = {
			title,
			slot_duration: duration,
			location,
			start_time: startTime,
			end_time: endTime,
			// Session dates and the tags toggle are admin-controlled — never
			// submitted from a host edit.
			...(!isHostEditing && startDate && { start_date: startDate }),
			...(!isHostEditing && endDate && { end_date: endDate }),
			...(!isHostEditing && { tags_editable: tagsEditable }),
			...(!isHostEditing && { hours_editable: hoursEditable }),
		};

		if (isEditMode && session) {
			updateSession(
				{ sessionId: session.id, data: payload },
				{
					onSuccess: () => {
						toast.success("Session updated successfully!");
						closeDialog();
					},
					onError: (error) => {
						toast.error("Failed to update session", {
							description: error.message || "An unexpected error occurred.",
						});
					},
				},
			);
		} else {
			createSession(payload, {
				onSuccess: () => {
					toast.success("Session created successfully!");
					closeDialog();
				},
				onError: (error) => {
					toast.error("Failed to create session", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			});
		}
	};

	const detailsForm = (
		<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-2 pr-1">
				<FormSection title="Basics">
					<div className="space-y-2">
						<Label htmlFor="session-title">Session title *</Label>
						<Input
							id="session-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Investors Speed Matchmaking"
							required
							disabled={isPending}
							className="rounded-none"
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="session-duration">Slot duration (minutes)</Label>
							<Input
								id="session-duration"
								type="number"
								value={duration}
								onChange={(e) => setDuration(Number(e.target.value))}
								min={5}
								max={180}
								required
								disabled={isPending}
								className="rounded-none"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="session-location">Location / link</Label>
							<Input
								id="session-location"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="e.g. Hall A, Table 3"
								disabled={isPending}
								className="rounded-none"
							/>
						</div>
					</div>
				</FormSection>

				<FormSection
					title="Schedule"
					description={
						isHostEditing
							? "Dates are set by your event admin — contact them to change these."
							: "Defaults to the event's dates, but can be set entirely before or after the event period."
					}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="session-start-date">Start date</Label>
							<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="session-start-date"
										type="button"
										variant="outline"
										disabled={isPending || isHostEditing}
										className={cn(
											"w-full justify-start rounded-none font-normal",
											!startDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
										{startDate
											? format(parseISO(startDate), "PPP")
											: "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto rounded-none p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={startDate ? parseISO(startDate) : undefined}
										onSelect={handleStartDatePick}
										disabled={isPending || isHostEditing}
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<Label htmlFor="session-end-date">End date</Label>
							<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="session-end-date"
										type="button"
										variant="outline"
										disabled={isPending || isHostEditing}
										className={cn(
											"w-full justify-start rounded-none font-normal",
											!endDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
										{endDate ? format(parseISO(endDate), "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto rounded-none p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={endDate ? parseISO(endDate) : undefined}
										onSelect={handleEndDatePick}
										disabled={(date) =>
											isPending ||
											isHostEditing ||
											(!!startDate && date < parseISO(startDate))
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="session-start">Daily start time</Label>
							<TimeSelect
								options={TIME_OPTIONS}
								open={startTimeOpen}
								onOpenChange={setStartTimeOpen}
								value={startTime}
								onValueChange={handleStartTimeChange}
								disabled={isPending || !canEditHours}
								className={cn(
									"w-full rounded-none",
									hasTimeConflict && "border-destructive",
								)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="session-end">Daily end time</Label>
							<TimeSelect
								options={TIME_OPTIONS.filter((t) => t > startTime)}
								open={endTimeOpen}
								onOpenChange={setEndTimeOpen}
								value={endTime}
								onValueChange={setEndTime}
								disabled={isPending || !canEditHours}
								className={cn(
									"w-full rounded-none",
									hasTimeConflict && "border-destructive",
								)}
							/>
						</div>
					</div>
					{hasTimeConflict && (
						<div className="flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
							<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
							<p>
								This range excludes{" "}
								{timeConflicts.bookings.length > 0 &&
									`${timeConflicts.bookings.length} existing booking${timeConflicts.bookings.length === 1 ? "" : "s"}`}
								{timeConflicts.bookings.length > 0 &&
									timeConflicts.blocks.length > 0 &&
									" and "}
								{timeConflicts.blocks.length > 0 &&
									`${timeConflicts.blocks.length} availability block${timeConflicts.blocks.length === 1 ? "" : "s"}`}
								. They'll remain as-is if you save — adjust the times if that's
								not intended.
							</p>
						</div>
					)}
				</FormSection>

				{!isHostEditing && (
					<FormSection
						title="Host permissions"
						description="What the assigned host is allowed to change themselves."
					>
						<PermissionRow
							id="session-tags-editable"
							title="Hosts can edit their own tags"
							description="Turn off if you're setting up tags for the host yourself and don't want them changed."
							checked={tagsEditable}
							onCheckedChange={setTagsEditable}
							disabled={isPending}
						/>
						<PermissionRow
							id="session-hours-editable"
							title="Hosts can edit their own hours"
							description="Turn off to keep this session's schedule fixed to what you set here."
							checked={hoursEditable}
							onCheckedChange={setHoursEditable}
							disabled={isPending}
						/>
					</FormSection>
				)}
			</div>

			<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background pt-4">
				{isEditMode && session && !isHostEditing && (
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleDelete}
							disabled={isPending}
							className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							{isDeleting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="mr-2 h-4 w-4" />
							)}
							Delete
						</Button>

						{!isArchived ? (
							<Button
								type="button"
								variant="outline"
								onClick={handleArchive}
								disabled={isPending}
								className="rounded-none text-amber-600 hover:bg-amber-50 hover:text-amber-700"
							>
								<Archive className="mr-2 h-4 w-4" />
								Archive
							</Button>
						) : (
							<Button
								type="button"
								variant="outline"
								onClick={handleUnarchive}
								disabled={isPending}
								className="rounded-none text-green-600 hover:bg-green-50 hover:text-green-700"
							>
								<ArchiveRestore className="mr-2 h-4 w-4" />
								Restore
							</Button>
						)}
					</div>
				)}
				<div className="ml-auto flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending} className="rounded-none">
						{(isCreating || isUpdating) && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isEditMode ? "Save changes" : "Create session"}
					</Button>
				</div>
			</div>
		</form>
	);

	if (!isEditMode || !session) {
		return detailsForm;
	}

	return (
		<Tabs
			defaultValue="details"
			className="flex min-h-0 w-full flex-1 flex-col"
		>
			<TabsList className="mb-4 grid w-full grid-cols-2 rounded-none">
				<TabsTrigger value="details" className="rounded-none">
					Session details
				</TabsTrigger>
				<TabsTrigger value="hours" className="rounded-none">
					Manage hours
				</TabsTrigger>
			</TabsList>
			<TabsContent value="details" className="flex min-h-0 flex-1 flex-col">
				{detailsForm}
			</TabsContent>
			<TabsContent value="hours" className="flex min-h-0 flex-1 flex-col">
				<ManageAvailabilityHours
					sessionId={session.id}
					eventId={eventId}
					hoursEditable={canEditHours}
					startDate={session.start_date?.slice(0, 10)}
					endDate={session.end_date?.slice(0, 10)}
				/>
			</TabsContent>
		</Tabs>
	);
};

export default CreateSessionDialog;
