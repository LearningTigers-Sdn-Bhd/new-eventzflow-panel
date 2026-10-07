"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	type CertificateAudience,
	type CertificateParticipant,
	getCertificateParticipants,
	sendCertificates,
} from "@/lib/api/certificate";

type Audience = CertificateAudience;

// Statuses that mean a certificate is already on its way / delivered.
const SENT_STATUSES = new Set(["queued", "sending", "sent", "delivered"]);

type SendCertificatesPanelProps = {
	eventId: string;
	onClose?: () => void;
};

export function SendCertificatesPanel({
	eventId,
	onClose,
}: SendCertificatesPanelProps) {
	const [audience, setAudience] = useState<Audience>("all");
	// Tracks the public_ids the admin has explicitly selected to receive a
	// certificate. Nothing is selected by default — the admin opts people in
	// (or uses "Select all").
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState("");
	// On by default so re-running a send never double-emails anyone. Untick it
	// to deliberately resend (e.g. an attendee says they never received it).
	const [skipSent, setSkipSent] = useState(true);
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();

	const {
		data: participants,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", eventId, "certificate-participants"],
		queryFn: () => getCertificateParticipants(eventId),
	});

	// Eligible recipients per the chosen audience. Participants already only
	// include ticket holders with an email.
	const eligible = useMemo<CertificateParticipant[]>(() => {
		const list = participants ?? [];
		return list.filter((p) => {
			if (audience === "checked_in" && !p.checked_in) return false;
			if (audience === "feedback_submitted" && !p.feedback_submitted)
				return false;
			if (audience === "rfid_qualified" && !p.rfid_qualified) return false;
			if (audience === "sessions_done" && !p.sessions_done) return false;
			if (
				audience === "sessions_or_feedback" &&
				!p.sessions_done &&
				!p.feedback_submitted
			) {
				return false;
			}
			if (
				(skipSent || audience === "unsent") &&
				p.certificate_status &&
				SENT_STATUSES.has(p.certificate_status)
			) {
				return false;
			}
			return true;
		});
	}, [participants, audience, skipSent]);

	const visible = useMemo(() => {
		if (!search.trim()) return eligible;
		const q = search.toLowerCase();
		return eligible.filter(
			(p) =>
				p.attendee_name.toLowerCase().includes(q) ||
				(p.attendee_email ?? "").toLowerCase().includes(q),
		);
	}, [eligible, search]);

	const recipientCount = eligible.filter((p) =>
		selected.has(p.public_id),
	).length;

	const toggle = (publicId: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(publicId)) {
				next.delete(publicId);
			} else {
				next.add(publicId);
			}
			return next;
		});
	};

	// "Select all" applies to the currently visible (searched + filtered) rows.
	const allVisibleSelected =
		visible.length > 0 && visible.every((p) => selected.has(p.public_id));

	const toggleSelectAll = () => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (allVisibleSelected) {
				for (const p of visible) next.delete(p.public_id);
			} else {
				for (const p of visible) next.add(p.public_id);
			}
			return next;
		});
	};

	const sendMutation = useMutation({
		mutationFn: () => {
			// Backend expects exclusions; derive them from the eligible set minus
			// the explicitly selected recipients.
			const excludedPublicIds = eligible
				.filter((p) => !selected.has(p.public_id))
				.map((p) => p.public_id);
			return sendCertificates(eventId, {
				audience,
				excluded_public_ids: excludedPublicIds,
				skip_sent: skipSent,
			});
		},
		onSuccess: (res) => {
			toast.success(
				`Queued ${res.queued} certificate${res.queued === 1 ? "" : "s"}` +
					(res.skipped_no_email > 0
						? `, skipped ${res.skipped_no_email} without email`
						: ""),
			);
			// Refresh the participants list so updated send status appears.
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-participants"],
			});
			onClose?.();
		},
		onError: (e: unknown) => {
			toast.error(
				e instanceof Error ? e.message : "Failed to send certificates",
			);
		},
	});

	// Confirm before emailing real attendees — a bulk send is hard to undo.
	const handleSend = () => {
		openConfirm({
			title: "Send certificates",
			message: `This will email a certificate to ${recipientCount} participant${
				recipientCount === 1 ? "" : "s"
			}. This cannot be undone.${
				skipSent
					? ""
					: " Anyone who already received a certificate will get another copy."
			} Continue?`,
			confirmLabel: "Send now",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			onConfirm: () => sendMutation.mutate(),
		});
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Audience</Label>
				<RadioGroup
					value={audience}
					onValueChange={(v) => setAudience(v as Audience)}
					className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
				>
					<label
						htmlFor="audience-rfid_qualified"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem
							id="audience-rfid_qualified"
							value="rfid_qualified"
							className="mt-0.5"
						/>
						<span>
							Finished all sessions and feedback
							<span className="block text-muted-foreground text-xs">
								Both required
							</span>
						</span>
					</label>
					<label
						htmlFor="audience-sessions_or_feedback"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem
							id="audience-sessions_or_feedback"
							value="sessions_or_feedback"
							className="mt-0.5"
						/>
						<span>
							Finished all sessions or feedback
							<span className="block text-muted-foreground text-xs">
								Either one is enough
							</span>
						</span>
					</label>
					<label
						htmlFor="audience-sessions_done"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem
							id="audience-sessions_done"
							value="sessions_done"
							className="mt-0.5"
						/>
						<span>
							Finished all sessions only
							<span className="block text-muted-foreground text-xs">
								Feedback not needed
							</span>
						</span>
					</label>
					<label
						htmlFor="audience-feedback_submitted"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem
							id="audience-feedback_submitted"
							value="feedback_submitted"
							className="mt-0.5"
						/>
						<span>
							Submitted feedback only
							<span className="block text-muted-foreground text-xs">
								Sessions not checked
							</span>
						</span>
					</label>
					<label
						htmlFor="audience-all"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem id="audience-all" value="all" className="mt-0.5" />
						<span>
							All ticket holders
							<span className="block text-muted-foreground text-xs">
								No attendance check
							</span>
						</span>
					</label>
					<label
						htmlFor="audience-checked_in"
						className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem
							id="audience-checked_in"
							value="checked_in"
							className="mt-0.5"
						/>
						<span>
							Only checked-in
							<span className="block text-muted-foreground text-xs">
								No attendance check
							</span>
						</span>
					</label>
				</RadioGroup>
				<label
					htmlFor="skip-sent"
					className="flex cursor-pointer items-center gap-2 text-sm"
				>
					<Checkbox
						id="skip-sent"
						checked={skipSent}
						onCheckedChange={(v) => setSkipSent(v === true)}
					/>
					Skip people who already received a certificate
				</label>
			</div>

			<div className="flex items-center justify-between gap-2">
				<Input
					placeholder="Search name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-xs rounded-none"
				/>
				<div className="flex items-center gap-3">
					<Badge variant="secondary" className="rounded-none">
						{recipientCount} selected
					</Badge>
					{visible.length > 0 && (
						<label
							htmlFor="select-all-recipients"
							className="flex cursor-pointer items-center gap-2 rounded-none border p-3 text-sm"
						>
							<Checkbox
								id="select-all-recipients"
								checked={allVisibleSelected}
								onCheckedChange={toggleSelectAll}
							/>
							Select all{search.trim() ? " (matching)" : ""}
						</label>
					)}
				</div>
			</div>

			<div className="rounded-none border">
				<div className="max-h-72 overflow-y-auto">
					{isLoading ? (
						<LoadingState title="Loading attendees..." height="h-48" />
					) : error ? (
						<ErrorState
							title="Failed to load attendees"
							height="h-48"
							action={<Button onClick={() => refetch()}>Retry</Button>}
						/>
					) : visible.length === 0 ? (
						<EmptyState
							title="No eligible attendees"
							description="No attendees match this audience and have an email on file."
							height="h-48"
						/>
					) : (
						<ul className="divide-y">
							{visible.map((p) => {
								const isSelected = selected.has(p.public_id);
								const alreadySent =
									p.certificate_status &&
									SENT_STATUSES.has(p.certificate_status);
								return (
									<li
										key={p.public_id}
										className="flex items-center gap-3 px-3 py-2 text-sm"
									>
										<Checkbox
											checked={isSelected}
											onCheckedChange={() => toggle(p.public_id)}
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">{p.attendee_name}</p>
											<p className="truncate text-muted-foreground text-xs">
												{p.attendee_email}
											</p>
										</div>
										{p.checked_in && (
											<Badge variant="outline" className="text-xs">
												Checked in
											</Badge>
										)}
										{p.feedback_submitted && (
											<Badge variant="outline" className="text-xs">
												Feedback
											</Badge>
										)}
										{alreadySent && (
											<Badge variant="outline" className="text-xs">
												Already sent
											</Badge>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>

			<div className="flex items-center justify-end gap-2">
				{onClose && (
					<Button variant="outline" className="rounded-none" onClick={onClose}>
						Cancel
					</Button>
				)}
				<Button
					className="rounded-none"
					onClick={handleSend}
					disabled={sendMutation.isPending || recipientCount === 0}
				>
					{sendMutation.isPending ? "Sending..." : `Send to ${recipientCount}`}
				</Button>
			</div>
		</div>
	);
}

export default SendCertificatesPanel;
