"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	getEmailLogSettings,
	updateEmailLogSettings,
	updateEmailLogSettingsSchema,
} from "@/lib/api/email-delivery";

interface EmailLogRetentionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const SETTINGS_KEY = ["email-log-settings"];

const PRESETS = [
	{ days: 90, label: "3 months" },
	{ days: 180, label: "6 months" },
	{ days: 365, label: "1 year" },
	{ days: 730, label: "2 years" },
	{ days: 1095, label: "3 years" },
	{ days: 1825, label: "5 years" },
	{ days: 3650, label: "10 years" },
];

// A value saved through the API that isn't a preset still shows up, so the
// dialog never hides or silently rewrites it.
function optionsFor(current: number | null) {
	if (current === null || PRESETS.some((preset) => preset.days === current)) {
		return PRESETS;
	}
	return [...PRESETS, { days: current, label: `${current} days` }].sort(
		(a, b) => a.days - b.days,
	);
}

export function EmailLogRetentionDialog({
	open,
	onOpenChange,
}: EmailLogRetentionDialogProps) {
	const queryClient = useQueryClient();
	const [retentionDays, setRetentionDays] = useState<number | null>(null);
	const [protectedDays, setProtectedDays] = useState<number | null>(null);
	const [purgeEnabled, setPurgeEnabled] = useState(false);

	const { data: settings, isLoading } = useQuery({
		queryKey: SETTINGS_KEY,
		queryFn: () => getEmailLogSettings(),
		enabled: open,
	});

	// Seed the selects from the server each time the dialog opens or the saved
	// values change.
	useEffect(() => {
		if (settings) {
			setRetentionDays(settings.retentionDays);
			setProtectedDays(settings.protectedRetentionDays);
			setPurgeEnabled(settings.purgeEnabled);
		}
	}, [settings]);

	const changed =
		settings !== undefined &&
		(retentionDays !== settings.retentionDays ||
			protectedDays !== settings.protectedRetentionDays ||
			purgeEnabled !== settings.purgeEnabled);

	// How many rows the nightly run would delete for the selected values.
	const { data: preview } = useQuery({
		queryKey: [...SETTINGS_KEY, "preview", retentionDays, protectedDays],
		queryFn: () =>
			getEmailLogSettings({
				retentionDays: retentionDays as number,
				protectedRetentionDays: protectedDays as number,
			}),
		enabled:
			open && changed && retentionDays !== null && protectedDays !== null,
		placeholderData: keepPreviousData,
	});
	const rowsToPurge = changed
		? (preview?.rowsToPurge ?? settings?.rowsToPurge)
		: settings?.rowsToPurge;

	const saveMutation = useMutation({
		mutationFn: () =>
			updateEmailLogSettings(
				updateEmailLogSettingsSchema.parse({
					retentionDays,
					protectedRetentionDays: protectedDays,
					purgeEnabled,
				}),
			),
		onSuccess: (saved) => {
			queryClient.setQueryData(SETTINGS_KEY, saved);
			toast.success("Email log retention updated.");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update retention.");
		},
	});

	const onRetentionChange = (days: number) => {
		setRetentionDays(days);
		// Evidence rows are never kept shorter than routine ones.
		if (protectedDays !== null && days > protectedDays) setProtectedDays(days);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Email log retention</DialogTitle>
					<DialogDescription>
						When automatic deletion is on, older rows are deleted every night at
						3:30 am.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="retention-normal">Keep normal emails for</Label>
						<Select
							value={retentionDays === null ? undefined : String(retentionDays)}
							onValueChange={(value) => onRetentionChange(Number(value))}
							disabled={isLoading}
						>
							<SelectTrigger
								id="retention-normal"
								className="w-full rounded-none"
							>
								<SelectValue placeholder="Select..." />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								{optionsFor(retentionDays).map((option) => (
									<SelectItem key={option.days} value={String(option.days)}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Sent, delivered, failed and skipped.
						</p>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="retention-protected">
							Keep bounced, complained and suppressed for
						</Label>
						<Select
							value={protectedDays === null ? undefined : String(protectedDays)}
							onValueChange={(value) => setProtectedDays(Number(value))}
							disabled={isLoading}
						>
							<SelectTrigger
								id="retention-protected"
								className="w-full rounded-none"
							>
								<SelectValue placeholder="Select..." />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								{optionsFor(protectedDays).map((option) => (
									<SelectItem
										key={option.days}
										value={String(option.days)}
										disabled={
											retentionDays !== null && option.days < retentionDays
										}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Kept at least as long as normal emails, as evidence of delivery
							problems.
						</p>
					</div>

					<div className="flex items-start justify-between gap-4 border border-dashed p-3">
						<div className="space-y-0.5">
							<Label htmlFor="retention-purge-enabled">
								Delete old rows automatically
							</Label>
							<p className="text-muted-foreground text-xs">
								Off by default. Nothing is deleted until you turn this on.
							</p>
						</div>
						<Switch
							id="retention-purge-enabled"
							checked={purgeEnabled}
							onCheckedChange={setPurgeEnabled}
							disabled={isLoading}
						/>
					</div>

					{rowsToPurge !== undefined && (
						<p
							className={
								purgeEnabled && rowsToPurge > 0
									? "border border-destructive border-dashed p-3 text-destructive text-sm"
									: "border border-dashed p-3 text-sm"
							}
						>
							<span className="font-medium">{rowsToPurge}</span> row(s) are past
							this window.{" "}
							{purgeEnabled
								? "They will be deleted at the next nightly run."
								: "They are kept because automatic deletion is off."}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
					<Button
						className="rounded-none"
						onClick={() => saveMutation.mutate()}
						disabled={isLoading || saveMutation.isPending || !changed}
					>
						{saveMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
