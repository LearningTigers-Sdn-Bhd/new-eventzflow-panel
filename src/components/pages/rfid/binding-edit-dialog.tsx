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
import {
	type RfidBinding,
	updateRfidBinding,
	updateRfidBindingSchema,
} from "@/lib/api/rfid";
import { type PickedTicket, TicketPicker } from "./ticket-picker";

/** Org-owner edit of an active binding: another ticket and/or sticker. */
export function BindingEditDialog({
	eventId,
	binding,
	onOpenChange,
}: {
	eventId: string;
	binding: RfidBinding | null;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [ticket, setTicket] = useState<PickedTicket | null>(null);
	const [tagKey, setTagKey] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const close = () => {
		setTicket(null);
		setTagKey("");
		setFormError(null);
		onOpenChange(false);
	};

	const mutation = useMutation({
		mutationFn: (data: Parameters<typeof updateRfidBinding>[2]) =>
			updateRfidBinding(eventId, binding?.id ?? 0, data),
		onSuccess: () => {
			toast.success("Binding updated.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			close();
		},
		onError: (error) => setFormError(error.message),
	});

	const submit = () => {
		setFormError(null);
		const key = tagKey.trim();
		const parsed = updateRfidBindingSchema.safeParse({
			ticket_public_id:
				ticket && ticket.publicId !== binding?.ticket_public_id
					? ticket.publicId
					: undefined,
			tag_key: key && key.toUpperCase() !== binding?.tag_key ? key : undefined,
		});
		if (!parsed.success) {
			setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		mutation.mutate(parsed.data);
	};

	return (
		<Dialog open={binding !== null} onOpenChange={(next) => !next && close()}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit binding</DialogTitle>
					<DialogDescription>
						Change the ticket or the sticker. Earlier readings of this sticker
						are re-measured against the new values.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Ticket (now: {binding?.ticket_name ?? "—"})</Label>
						<TicketPicker
							eventId={eventId}
							value={ticket}
							onSelect={(next) => {
								setTicket(next);
								setFormError(null);
							}}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="binding-tag-key">
							Sticker tag key (now: {binding?.tag_key})
						</Label>
						<Input
							id="binding-tag-key"
							className="rounded-none font-mono"
							placeholder="e.g. 98D24A1C090104E0"
							value={tagKey}
							onChange={(event) => {
								setTagKey(event.target.value);
								setFormError(null);
							}}
						/>
					</div>
					{formError && <p className="text-destructive text-sm">{formError}</p>}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={close}
						disabled={mutation.isPending}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						onClick={submit}
						disabled={mutation.isPending || (!ticket && !tagKey.trim())}
					>
						{mutation.isPending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
