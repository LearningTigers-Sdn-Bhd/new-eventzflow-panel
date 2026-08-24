import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TagChipInput } from "@/components/admin-ui/form/tag-chip-input";
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
import { useDialog } from "@/hooks/use-dialog";
import type {
	BusinessMatchingEvent,
	BusinessMatchingEventDefaults,
} from "@/lib/api/business-matching";
import { addMinutesToTime, TIME_OPTIONS } from "@/lib/time-blocks";
import { cn } from "@/lib/utils";
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

const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
	eventId,
	session,
	eventStartDate,
	eventEndDate,
	eventDefaults,
	isHostEditing = false,
}) => {
	const { closeDialog } = useDialog();
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

	const handleDelete = () => {
		if (!session) return;
		if (
			confirm(`Are you sure you want to delete session "${session.title}"?`)
		) {
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
		}
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
	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);
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
			// Tags are only accepted on session creation — the event's tag list
			// is edited afterward via "Manage Tags".
			...(!isEditMode && {
				offering_tags: offeringTags,
				interest_tags: interestTags,
			}),
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
		<form onSubmit={handleSubmit} className="space-y-4 py-2">
			<div className="space-y-2">
				<Label htmlFor="session-title">Session Title *</Label>
				<Input
					id="session-title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g. Investors Speed Matchmaking"
					required
					disabled={isPending}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="session-duration">Slot Duration (minutes)</Label>
					<Input
						id="session-duration"
						type="number"
						value={duration}
						onChange={(e) => setDuration(Number(e.target.value))}
						min={5}
						max={180}
						required
						disabled={isPending}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-location">Location / Link</Label>
					<Input
						id="session-location"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder="e.g. Hall A, Table 3"
						disabled={isPending}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="session-start">Daily Start Time</Label>
					<TimeSelect
						options={TIME_OPTIONS}
						open={startTimeOpen}
						onOpenChange={setStartTimeOpen}
						value={startTime}
						onValueChange={handleStartTimeChange}
						disabled={isPending || !canEditHours}
						className={cn("w-full", hasTimeConflict && "border-destructive")}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-end">Daily End Time</Label>
					<TimeSelect
						options={TIME_OPTIONS.filter((t) => t > startTime)}
						open={endTimeOpen}
						onOpenChange={setEndTimeOpen}
						value={endTime}
						onValueChange={setEndTime}
						disabled={isPending || !canEditHours}
						className={cn("w-full", hasTimeConflict && "border-destructive")}
					/>
				</div>
				{hasTimeConflict && (
					<p className="col-span-2 text-destructive text-xs">
						This range excludes{" "}
						{timeConflicts.bookings.length > 0 &&
							`${timeConflicts.bookings.length} existing booking${timeConflicts.bookings.length === 1 ? "" : "s"}`}
						{timeConflicts.bookings.length > 0 &&
							timeConflicts.blocks.length > 0 &&
							" and "}
						{timeConflicts.blocks.length > 0 &&
							`${timeConflicts.blocks.length} availability block${timeConflicts.blocks.length === 1 ? "" : "s"}`}
						. They'll remain as-is if you save — adjust the times if that's not
						intended.
					</p>
				)}
			</div>

			<div className="!mt-2 grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="session-start-date">Session Start Date</Label>
					<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
						<PopoverTrigger asChild>
							<Button
								id="session-start-date"
								type="button"
								variant="outline"
								disabled={isPending || isHostEditing}
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
								onSelect={handleStartDatePick}
								disabled={isPending || isHostEditing}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-end-date">Session End Date</Label>
					<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
						<PopoverTrigger asChild>
							<Button
								id="session-end-date"
								type="button"
								variant="outline"
								disabled={isPending || isHostEditing}
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
				<p className="col-span-2 -mt-2 text-muted-foreground text-xs">
					{isHostEditing
						? "Set by your event admin — contact them to change these dates."
						: "Defaults to the event's dates, but can be set entirely before or after the event period."}
				</p>
			</div>

			{!isEditMode && !isHostEditing && (
				<div className="space-y-4">
					<TagChipInput
						label="Offering Tags"
						value={offeringTags}
						onChange={setOfferingTags}
						placeholder="e.g. SaaS, Consulting, Seed Fund"
						description="What hosts and attendees can select to describe what they offer."
						disabled={isPending}
					/>
					<TagChipInput
						label="Interest Tags"
						value={interestTags}
						onChange={setInterestTags}
						placeholder="e.g. Enterprise Clients, Distributors"
						description="What hosts and attendees can select to describe what they're seeking."
						disabled={isPending}
					/>
				</div>
			)}

			{!isHostEditing && (
				<div className="flex items-center justify-between rounded-lg border p-3">
					<div className="space-y-0.5">
						<Label htmlFor="session-tags-editable">
							Hosts can edit their own tags
						</Label>
						<p className="text-muted-foreground text-xs">
							Turn off if you're setting up tags for the host yourself and don't
							want them changed.
						</p>
					</div>
					<Switch
						id="session-tags-editable"
						checked={tagsEditable}
						onCheckedChange={setTagsEditable}
						disabled={isPending}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
					/>
				</div>
			)}

			{!isHostEditing && (
				<div className="flex items-center justify-between rounded-lg border p-3">
					<div className="space-y-0.5">
						<Label htmlFor="session-hours-editable">
							Hosts can edit their own hours
						</Label>
						<p className="text-muted-foreground text-xs">
							Turn off to keep this session's schedule fixed to what you set
							here.
						</p>
					</div>
					<Switch
						id="session-hours-editable"
						checked={hoursEditable}
						onCheckedChange={setHoursEditable}
						disabled={isPending}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
					/>
				</div>
			)}

			<div className="flex items-center justify-between pt-4">
				{isEditMode && session && !isHostEditing && (
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
					>
						{isDeleting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="mr-2 h-4 w-4" />
						)}
						Delete Session
					</Button>
				)}
				<div className="ml-auto flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{(isCreating || isUpdating) && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isEditMode ? "Save Changes" : "Create Session"}
					</Button>
				</div>
			</div>
		</form>
	);

	if (!isEditMode || !session) {
		return detailsForm;
	}

	return (
		<Tabs defaultValue="details" className="w-full">
			<TabsList className="mb-4 grid w-full grid-cols-2">
				<TabsTrigger value="details">Session Details</TabsTrigger>
				<TabsTrigger value="hours">Manage Hours</TabsTrigger>
			</TabsList>
			<TabsContent value="details">{detailsForm}</TabsContent>
			<TabsContent value="hours">
				<ManageAvailabilityHours
					sessionId={session.id}
					eventId={eventId}
					hoursEditable={canEditHours}
				/>
			</TabsContent>
		</Tabs>
	);
};

export default CreateSessionDialog;
