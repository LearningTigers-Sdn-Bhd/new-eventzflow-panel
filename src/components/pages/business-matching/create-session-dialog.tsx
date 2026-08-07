import { Loader2, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useCreateBusinessMatchingSession,
	useDeleteBusinessMatchingSession,
	useUpdateBusinessMatchingSession,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type {
	BusinessMatchingEvent,
	BusinessMatchingEventDefaults,
} from "@/lib/api/business-matching";
import ManageAvailabilityHours from "./manage-availability-hours";

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

	const isPending = isCreating || isUpdating || isDeleting;

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

	useEffect(() => {
		if (session) {
			setTitle(session.title || "");
			setDuration(Number(session.duration) || 30);
			setLocation(session.location || "");
			setStartDate(session.start_date?.slice(0, 10) || "");
			setEndDate(session.end_date?.slice(0, 10) || "");
			setTagsEditable(session.tags_editable ?? true);
			setHoursEditable(session.hours_editable ?? true);
			// Optional start/end time pre-fill (default 9-5)
			// (If backend returned them we could parse them, otherwise fallbacks are fine)
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
					<Input
						id="session-start"
						type="time"
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						required
						disabled={isPending}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-end">Daily End Time</Label>
					<Input
						id="session-end"
						type="time"
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						required
						disabled={isPending}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="session-start-date">Session Start Date</Label>
					<Input
						id="session-start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						disabled={isPending || isHostEditing}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-end-date">Session End Date</Label>
					<Input
						id="session-end-date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						disabled={isPending || isHostEditing}
					/>
				</div>
				<p className="col-span-2 -mt-2 text-muted-foreground text-xs">
					{isHostEditing
						? "Set by your event admin — contact them to change these dates."
						: "Defaults to the event's dates, but can be set entirely before or after the event period."}
				</p>
			</div>

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
					hoursEditable={
						isHostEditing
							? (session.host?.hours_editable_effective ?? true)
							: true
					}
				/>
			</TabsContent>
		</Tabs>
	);
};

export default CreateSessionDialog;
