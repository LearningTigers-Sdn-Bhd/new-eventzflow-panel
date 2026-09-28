"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export function SettingsTab({
	eventId,
	settings,
	canUpdate,
}: {
	eventId: string;
	settings: RfidSettings;
	canUpdate: boolean;
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
		},
		onError: (error) => setFormError(error.message),
	});

	return (
		<Card className="w-full rounded-none border-dashed shadow-none">
			<CardHeader>
				<CardTitle>RFID settings</CardTitle>
				<CardDescription>
					These settings tell RfiDex desks and gates how to behave for this
					event.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
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
					{mode === "write" && (
						<Alert className="rounded-none border-amber-300 bg-amber-50 text-amber-900">
							<AlertTitle>Write operation is not available yet</AlertTitle>
							<AlertDescription>
								Write mode is not currently available. Saving this setting will
								not enable any write operations.
							</AlertDescription>
						</Alert>
					)}
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
							When on, gates deny entry to tags whose ticket has not checked in.
							When off, those entries are accepted but flagged.
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
			</CardContent>
		</Card>
	);
}
