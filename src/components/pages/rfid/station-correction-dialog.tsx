"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type RfidStation,
	type RfidStationRole,
	type RfidUidRule,
	updateRfidStation,
	updateRfidStationSchema,
} from "@/lib/api/rfid";

/**
 * Reasoned station correction. A role/UID-rule change applies to future
 * reads; only explicitly named observation IDs are re-measured, and raw
 * records are never rewritten. The backend rejects the change without a
 * reason and `confirm: true`, so both are required here before submit.
 */
export function StationCorrectionDialog({
	eventId,
	station,
	canUpdate,
	open,
	onOpenChange,
}: {
	eventId: string;
	station: RfidStation | null;
	canUpdate: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [role, setRole] = useState<RfidStationRole | "">("");
	const [uidRule, setUidRule] = useState<RfidUidRule | "">("");
	const [reason, setReason] = useState("");
	const [confirm, setConfirm] = useState(false);
	const [observationIds, setObservationIds] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const reset = () => {
		setRole("");
		setUidRule("");
		setReason("");
		setConfirm(false);
		setObservationIds("");
		setFormError(null);
	};

	const mutation = useMutation({
		mutationFn: (data: Parameters<typeof updateRfidStation>[2]) =>
			updateRfidStation(eventId, station?.id ?? 0, data),
		onSuccess: () => {
			toast.success("Station updated and correction recorded.");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "rfid"],
			});
			onOpenChange(false);
			reset();
		},
		onError: (error) => setFormError(error.message),
	});

	const handleSubmit = () => {
		if (!station) return;
		setFormError(null);

		const ids = observationIds
			.split(/[,\s]+/)
			.map((s) => s.trim())
			.filter(Boolean)
			.map(Number);

		const parsed = updateRfidStationSchema.safeParse({
			role: role === "" ? undefined : role,
			uid_rule: uidRule === "" ? undefined : uidRule,
			reason,
			confirm: confirm ? true : undefined,
			observation_ids: ids.length > 0 ? ids : undefined,
		});
		if (!parsed.success) {
			setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		if (ids.some((n) => !Number.isInteger(n) || n <= 0)) {
			setFormError("Observation IDs must be positive whole numbers.");
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
					<DialogTitle>Correct station {station?.station_key}</DialogTitle>
					<DialogDescription>
						Changes apply to future reads. Past raw readings are never rewritten
						— only observation IDs you name are re-measured. A reason and
						explicit confirmation are required.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="rfid-role">
							Role (current: {station?.role ?? "unset"})
						</Label>
						<Select
							value={role}
							onValueChange={(v) => {
								setRole(v as RfidStationRole);
								setFormError(null);
							}}
							disabled={!canUpdate}
						>
							<SelectTrigger id="rfid-role" className="w-full rounded-none">
								<SelectValue placeholder="Keep current role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="entry">entry</SelectItem>
								<SelectItem value="exit">exit</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rfid-uid-rule">
							UID rule (current: {station?.uid_rule})
						</Label>
						<Select
							value={uidRule}
							onValueChange={(v) => {
								setUidRule(v as RfidUidRule);
								setFormError(null);
							}}
							disabled={!canUpdate}
						>
							<SelectTrigger id="rfid-uid-rule" className="w-full rounded-none">
								<SelectValue placeholder="Keep current UID rule" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="as_is">as_is</SelectItem>
								<SelectItem value="reversed">reversed</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Only change after verifying raw bytes across devices — this
							re-keys future readings, it does not fix history.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rfid-obs-ids">
							Re-measure observation IDs (optional)
						</Label>
						<Input
							id="rfid-obs-ids"
							className="rounded-none"
							placeholder="e.g. 1024, 1031"
							value={observationIds}
							onChange={(e) => {
								setObservationIds(e.target.value);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
						<p className="text-muted-foreground text-xs">
							Comma-separated IDs of this station's readings to re-adjudicate
							with the new role/rule. Leave empty to affect future reads only.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rfid-reason">Reason (required)</Label>
						<Textarea
							id="rfid-reason"
							className="rounded-none"
							placeholder="e.g. door sign says exit; verified bytes are reversed on this reader"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
					</div>

					<div className="flex items-start gap-2">
						<Checkbox
							id="rfid-confirm"
							checked={confirm}
							onCheckedChange={(checked) => {
								setConfirm(checked === true);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
						<Label htmlFor="rfid-confirm" className="font-normal text-sm">
							I confirm this role/UID-rule change and understand it is recorded
							as a correction.
						</Label>
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
						{mutation.isPending ? "Saving…" : "Save correction"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
