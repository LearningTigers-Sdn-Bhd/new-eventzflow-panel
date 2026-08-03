import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import {
	useCreateBusinessMatchingSession,
	useUpdateBusinessMatchingSession,
	useDeleteBusinessMatchingSession,
} from "@/hooks/use-business-matching";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";

interface CreateSessionDialogProps {
	eventId: string;
	session?: BusinessMatchingEvent; // If provided, edit mode
}

const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
	eventId,
	session,
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
			confirm(
				`Are you sure you want to delete session "${session.title}"?`,
			)
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
	const [adminEmail, setAdminEmail] = useState("");
	const [adminWaNumber, setAdminWaNumber] = useState("");
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("17:00");

	useEffect(() => {
		if (session) {
			setTitle(session.title || "");
			setDuration(Number(session.duration) || 30);
			setLocation(session.location || "");
			setAdminEmail(session.admin_email || "");
			setAdminWaNumber(session.admin_wa_number || "");
			// Optional start/end time pre-fill (default 9-5)
			// (If backend returned them we could parse them, otherwise fallbacks are fine)
		}
	}, [session]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Session Title is required.");
			return;
		}

		const payload = {
			title,
			slot_duration: duration,
			location,
			admin_email: adminEmail,
			admin_wa_number: adminWaNumber,
			start_time: startTime,
			end_time: endTime,
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

	return (
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
					<Label htmlFor="session-email">Admin Contact Email</Label>
					<Input
						id="session-email"
						type="email"
						value={adminEmail}
						onChange={(e) => setAdminEmail(e.target.value)}
						placeholder="admin@example.com"
						disabled={isPending}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="session-wa">Admin WhatsApp Number</Label>
					<Input
						id="session-wa"
						value={adminWaNumber}
						onChange={(e) => setAdminWaNumber(e.target.value)}
						placeholder="e.g. +60123456789"
						disabled={isPending}
					/>
				</div>
			</div>

			<div className="flex justify-between items-center pt-4">
				{isEditMode && session && (
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
				<div className="flex gap-2 ml-auto">
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
};

export default CreateSessionDialog;
