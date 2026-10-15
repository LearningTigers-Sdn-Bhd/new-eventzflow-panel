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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	grantRfidCertOverride,
	type RfidEligibilityRow,
	revokeRfidCertOverride,
} from "@/lib/api/rfid";

/**
 * Waives the session attendance rule for one guest so they can still earn the
 * e-certificate (feedback is still required). Audited: actor, time, reason.
 */
export function CertOverrideDialog({
	eventId,
	row,
	onClose,
}: {
	eventId: string;
	row: RfidEligibilityRow | null;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);

	const done = (message: string) => {
		toast.success(message);
		queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
		onClose();
	};
	const grant = useMutation({
		mutationFn: () =>
			grantRfidCertOverride(eventId, row?.id ?? 0, { reason: reason.trim() }),
		onSuccess: () => done("Attendance waived."),
		onError: (e) => setError(e.message),
	});
	const revoke = useMutation({
		mutationFn: () => revokeRfidCertOverride(eventId, row?.id ?? 0),
		onSuccess: () => done("Waiver removed."),
		onError: (e) => setError(e.message),
	});

	return (
		<Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Waive attendance</DialogTitle>
					<DialogDescription>
						{row?.override
							? `${row.ticket_name} is already waived: "${row.override.reason}".`
							: `Count every required session as attended for ${row?.ticket_name}. They still need to submit the evaluation form to qualify.`}
					</DialogDescription>
				</DialogHeader>

				{row?.override ? null : (
					<div className="space-y-2">
						<Label htmlFor="cert-override-reason">Reason (required)</Label>
						<Textarea
							id="cert-override-reason"
							className="rounded-none"
							placeholder="e.g. left the hall to handle logistics, approved by organizer"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								setError(null);
							}}
						/>
					</div>
				)}
				{error && <p className="text-destructive text-sm">{error}</p>}

				<DialogFooter>
					<Button variant="outline" className="rounded-none" onClick={onClose}>
						Cancel
					</Button>
					{row?.override ? (
						<Button
							variant="destructive"
							className="rounded-none"
							disabled={revoke.isPending}
							onClick={() => revoke.mutate()}
						>
							{revoke.isPending ? "Removing…" : "Remove waiver"}
						</Button>
					) : (
						<Button
							className="rounded-none"
							disabled={!reason.trim() || grant.isPending}
							onClick={() => grant.mutate()}
						>
							{grant.isPending ? "Saving…" : "Waive attendance"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
