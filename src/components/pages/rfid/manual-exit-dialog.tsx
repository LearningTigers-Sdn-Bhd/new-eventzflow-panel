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
import {
	manualExitRfidVisit,
	manualExitSchema,
	type RfidVisit,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";

// `datetime-local` has no timezone; the backend parses RFC3339, so convert
// the local wall time the operator typed to a UTC ISO string.
function localInputToIso(value: string): string | null {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function nowForInput(): string {
	const now = new Date();
	now.setSeconds(0, 0);
	// datetime-local expects local time without the trailing Z.
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
		.toISOString()
		.slice(0, 16);
}

/**
 * Manual exit: closes an open visit by recording a correction with actor,
 * time and reason. Never creates a synthetic gate observation and never
 * overwrites the raw record — the badge shows the exit as manual.
 */
export function ManualExitDialog({
	eventId,
	visit,
	canUpdate,
	open,
	onOpenChange,
}: {
	eventId: string;
	visit: RfidVisit | null;
	canUpdate: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [at, setAt] = useState(nowForInput);
	const [reason, setReason] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const reset = () => {
		setAt(nowForInput());
		setReason("");
		setFormError(null);
	};

	const mutation = useMutation({
		mutationFn: (data: { at: string; reason: string }) =>
			manualExitRfidVisit(eventId, visit?.id ?? 0, data),
		onSuccess: () => {
			toast.success("Visit closed manually.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			onOpenChange(false);
			reset();
		},
		onError: (error) => setFormError(error.message),
	});

	const handleSubmit = () => {
		if (!visit) return;
		setFormError(null);

		const iso = localInputToIso(at);
		const parsed = manualExitSchema.safeParse({ at: iso ?? at, reason });
		if (!parsed.success) {
			setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		if (visit.entry_at && new Date(parsed.data.at) < new Date(visit.entry_at)) {
			setFormError("The exit cannot be before the visit started.");
			return;
		}
		mutation.mutate(parsed.data);
	};

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
					<DialogTitle>Manual exit</DialogTitle>
					<DialogDescription>
						Close the open visit for {visit?.ticket_name ?? "this ticket"}{" "}
						(entered {formatDateTime(visit?.entry_at)}). This records a
						correction — it does not create a gate observation — and the visit
						is marked as a manual exit.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="manual-exit-at">Exit time (required)</Label>
						<Input
							id="manual-exit-at"
							type="datetime-local"
							className="rounded-none"
							value={at}
							onChange={(e) => {
								setAt(e.target.value);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="manual-exit-reason">Reason (required)</Label>
						<Textarea
							id="manual-exit-reason"
							className="rounded-none"
							placeholder="e.g. guest left through the side door without tapping out"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								setFormError(null);
							}}
							disabled={!canUpdate}
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
						disabled={!canUpdate || mutation.isPending}
					>
						{mutation.isPending ? "Closing…" : "Close visit"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
