"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DoorClosed, Undo2 } from "lucide-react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	manualExitAllRfidVisits,
	manualExitSchema,
	undoManualExitAllRfidVisits,
} from "@/lib/api/rfid";
import { ConfirmDialog } from "./confirm-dialog";

// `datetime-local` has no timezone; send the operator's local wall time as UTC.
function nowForInput(): string {
	const now = new Date();
	now.setSeconds(0, 0);
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
		.toISOString()
		.slice(0, 16);
}

/**
 * Master manual exit: closes every open visit (the selected ticket type, or
 * everyone) at one time with one reason. Each visit gets its own audited
 * manual-exit correction, same as the per-guest button.
 */
export function ManualExitAllDialog({
	eventId,
	ticketTypeId,
	inside,
}: {
	eventId: string;
	ticketTypeId: string;
	inside: number;
}) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [at, setAt] = useState(nowForInput);
	const [reason, setReason] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: (data: { at: string; reason: string }) =>
			manualExitAllRfidVisits(eventId, {
				...data,
				...(ticketTypeId ? { ticket_type_id: ticketTypeId } : {}),
			}),
		onSuccess: ({ closed }) => {
			toast.success(`${closed} visits closed manually.`);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			setOpen(false);
			setReason("");
		},
		onError: (error) => setFormError(error.message),
	});

	const handleSubmit = () => {
		setFormError(null);
		const date = new Date(at);
		const parsed = manualExitSchema.safeParse({
			at: Number.isNaN(date.getTime()) ? at : date.toISOString(),
			reason,
		});
		if (!parsed.success) {
			setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		mutation.mutate(parsed.data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) {
					setAt(nowForInput());
					setFormError(null);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="rounded-none">
					<DoorClosed className="size-4" />
					Mark all as exited
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Mark all as exited</DialogTitle>
					<DialogDescription>
						Close all {inside.toLocaleString()} guests still counted inside
						{ticketTypeId ? " for the selected ticket type" : ""}. Use this when
						the hall is empty but guests left without tapping out. Each visit is
						marked as a manual exit; guests who entered after the chosen time
						stay inside.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="manual-exit-all-at">Exit time (required)</Label>
						<Input
							id="manual-exit-all-at"
							type="datetime-local"
							className="rounded-none"
							value={at}
							onChange={(e) => setAt(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="manual-exit-all-reason">Reason (required)</Label>
						<Textarea
							id="manual-exit-all-reason"
							className="rounded-none"
							placeholder="e.g. event ended, hall cleared"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
					{formError && <p className="text-destructive text-sm">{formError}</p>}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						onClick={handleSubmit}
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Closing…" : "Close all visits"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Undo the newest sweep: those guests count as inside again. */
export function UndoManualExitAllButton({
	eventId,
	closed,
}: {
	eventId: string;
	closed: number;
}) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const mutation = useMutation({
		mutationFn: () => undoManualExitAllRfidVisits(eventId),
		onSuccess: ({ reopened }) => {
			toast.success(`${reopened} visits reopened.`);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			setOpen(false);
		},
		onError: (error) => toast.error(error.message),
	});

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				className="rounded-none"
				onClick={() => setOpen(true)}
			>
				<Undo2 className="size-4" />
				Undo last sweep ({closed.toLocaleString()})
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={setOpen}
				title="Undo last sweep?"
				description={`${closed.toLocaleString()} guests closed by the last "Mark all as exited" go back to inside, unless a gate has read them since.`}
				confirmLabel="Undo sweep"
				pending={mutation.isPending}
				onConfirm={() => mutation.mutate()}
			/>
		</>
	);
}
