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
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	type RfidMode,
	type RfidSettings,
	updateRfidSettings,
} from "@/lib/api/rfid";

export function SettingsDialog({
	eventId,
	settings,
	canUpdate,
	open,
	onOpenChange,
}: {
	eventId: string;
	settings: RfidSettings;
	canUpdate: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [mode, setMode] = useState<RfidMode>(settings.rfid_mode);
	const [requireCheckIn, setRequireCheckIn] = useState(
		settings.require_check_in,
	);
	const [confirm, setConfirm] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const dirty =
		mode !== settings.rfid_mode || requireCheckIn !== settings.require_check_in;

	const mutation = useMutation({
		mutationFn: () =>
			updateRfidSettings(eventId, {
				...(mode !== settings.rfid_mode ? { rfid_mode: mode } : {}),
				...(requireCheckIn !== settings.require_check_in
					? { require_check_in: requireCheckIn }
					: {}),
			}),
		onSuccess: () => {
			toast.success("RFID settings updated.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			setConfirm(false);
			setFormError(null);
			onOpenChange(false);
		},
		onError: (error) => setFormError(error.message),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>RFID settings</DialogTitle>
					<DialogDescription>
						These settings tell RfiDex desks and gates how to behave for this
						event.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="rfid-mode">Mode</Label>
						<Select
							value={mode}
							onValueChange={(v) => {
								setMode(v as RfidMode);
								setFormError(null);
							}}
							disabled={!canUpdate}
						>
							<SelectTrigger id="rfid-mode" className="w-full rounded-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bind">
									bind — link existing stickers
								</SelectItem>
								<SelectItem value="write">write — encode stickers</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-start gap-3">
						<Switch
							id="rfid-require-check-in"
							checked={requireCheckIn}
							onCheckedChange={(checked) => {
								setRequireCheckIn(checked);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
						<div className="space-y-1">
							<Label htmlFor="rfid-require-check-in">
								Require check-in before entry
							</Label>
							<p className="text-muted-foreground text-sm">
								When on, gates deny entry to tags whose ticket has not checked
								in. When off, those entries are accepted but flagged.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<Checkbox
							id="rfid-settings-confirm"
							checked={confirm}
							onCheckedChange={(checked) => {
								setConfirm(checked === true);
								setFormError(null);
							}}
							disabled={!canUpdate}
						/>
						<Label
							htmlFor="rfid-settings-confirm"
							className="font-normal text-sm"
						>
							I confirm these changes apply to this event's RFID devices.
						</Label>
					</div>

					{formError && <p className="text-destructive text-sm">{formError}</p>}

					<Button
						className="rounded-none"
						onClick={() => mutation.mutate()}
						disabled={!canUpdate || !dirty || !confirm || mutation.isPending}
					>
						{mutation.isPending ? "Saving…" : "Save settings"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
