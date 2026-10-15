"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { manualEntryRfidVisit, manualEntrySchema } from "@/lib/api/rfid";
import { type PickedTicket, TicketPicker } from "./ticket-picker";

// `datetime-local` has no timezone; the backend parses RFC3339.
const toIso = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

/**
 * Manual entry: adds a closed visit for a guest the gate missed (gate offline,
 * power cut, sticker unread). Recorded as a correction with actor and reason;
 * it never creates a gate reading.
 */
export function ManualEntryDialog({
	eventId,
	open,
	onOpenChange,
}: {
	eventId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [ticket, setTicket] = useState<PickedTicket | null>(null);
	const [entryAt, setEntryAt] = useState("");
	const [exitAt, setExitAt] = useState("");
	const [reason, setReason] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const reset = () => {
		setTicket(null);
		setEntryAt("");
		setExitAt("");
		setReason("");
		setFormError(null);
	};

	const mutation = useMutation({
		mutationFn: manualEntryRfidVisit.bind(null, eventId),
		onSuccess: () => {
			toast.success("Visit added.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			onOpenChange(false);
			reset();
		},
		onError: (error) => setFormError(error.message),
	});

	const handleSubmit = () => {
		setFormError(null);
		const parsed = manualEntrySchema.safeParse({
			ticket_public_id: ticket?.publicId ?? "",
			entry_at: entryAt ? toIso(entryAt) : "",
			exit_at: exitAt ? toIso(exitAt) : undefined,
			reason,
		});
		if (!parsed.success) {
			setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		mutation.mutate(parsed.data);
	};

	const clearError = () => setFormError(null);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) reset();
			}}
		>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add missed visit</DialogTitle>
					<DialogDescription>
						For a guest the gate did not record coming in (gate offline, sticker
						not read). This records a correction, not a gate reading, and counts
						towards session attendance.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Guest (required)</Label>
						<TicketPicker
							eventId={eventId}
							value={ticket}
							onSelect={(next) => {
								setTicket(next);
								clearError();
							}}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="manual-entry-in">Came in (required)</Label>
							<Input
								id="manual-entry-in"
								type="datetime-local"
								className="rounded-none"
								value={entryAt}
								onChange={(e) => {
									setEntryAt(e.target.value);
									clearError();
								}}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="manual-entry-out">Left (optional)</Label>
							<Input
								id="manual-entry-out"
								type="datetime-local"
								className="rounded-none"
								value={exitAt}
								onChange={(e) => {
									setExitAt(e.target.value);
									clearError();
								}}
							/>
						</div>
					</div>
					<p className="text-muted-foreground text-xs">
						Leave "Left" empty if the guest is still inside: their next gate
						exit will close the visit. If they already left and the exit was
						missed, fill it in.
					</p>

					<div className="space-y-2">
						<Label htmlFor="manual-entry-reason">Reason (required)</Label>
						<Textarea
							id="manual-entry-reason"
							className="rounded-none"
							placeholder="e.g. IN gate lost power, guest confirmed by staff"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								clearError();
							}}
						/>
					</div>

					{formError && <p className="text-destructive text-sm">{formError}</p>}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						onClick={handleSubmit}
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Adding…" : "Add visit"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
