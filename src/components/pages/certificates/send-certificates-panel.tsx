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
	type CertificateParticipant,
	getCertificateParticipants,
	sendCertificates,
} from "@/lib/api/certificate";

type Audience = "all" | "checked_in" | "unsent";

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
	// Tracks public_ids the admin explicitly removed from the send.
	const [excluded, setExcluded] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState("");
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
			if (
				audience === "unsent" &&
				p.certificate_status &&
				SENT_STATUSES.has(p.certificate_status)
			) {
				return false;
			}
			return true;
		});
	}, [participants, audience]);

	const visible = useMemo(() => {
		if (!search.trim()) return eligible;
		const q = search.toLowerCase();
		return eligible.filter(
			(p) =>
				p.attendee_name.toLowerCase().includes(q) ||
				(p.attendee_email ?? "").toLowerCase().includes(q),
		);
	}, [eligible, search]);

	const recipientCount = eligible.filter(
		(p) => !excluded.has(p.public_id),
	).length;

	const toggle = (publicId: string) => {
		setExcluded((prev) => {
			const next = new Set(prev);
			if (next.has(publicId)) {
				next.delete(publicId);
			} else {
				next.add(publicId);
			}
			return next;
		});
	};

	const sendMutation = useMutation({
		mutationFn: () =>
			sendCertificates(eventId, {
				audience,
				excluded_public_ids: Array.from(excluded),
			}),
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
			}. This cannot be undone. Continue?`,
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
					className="grid grid-cols-1 gap-2 sm:grid-cols-3"
				>
					<label
						htmlFor="audience-all"
						className="flex cursor-pointer items-center gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem id="audience-all" value="all" />
						All ticket holders
					</label>
					<label
						htmlFor="audience-checked-in"
						className="flex cursor-pointer items-center gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem id="audience-checked-in" value="checked_in" />
						Only checked-in
					</label>
					<label
						htmlFor="audience-unsent"
						className="flex cursor-pointer items-center gap-2 rounded-none border p-3 text-sm"
					>
						<RadioGroupItem id="audience-unsent" value="unsent" />
						Not yet sent
					</label>
				</RadioGroup>
			</div>

			<div className="flex items-center justify-between gap-2">
				<Input
					placeholder="Search name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-xs"
				/>
				<Badge variant="secondary">{recipientCount} recipients</Badge>
			</div>

			<div className="max-h-72 overflow-y-auto rounded-none border">
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
							const included = !excluded.has(p.public_id);
							const alreadySent =
								p.certificate_status && SENT_STATUSES.has(p.certificate_status);
							return (
								<li
									key={p.public_id}
									className="flex items-center gap-3 px-3 py-2 text-sm"
								>
									<Checkbox
										checked={included}
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

			<div className="flex items-center justify-end gap-2">
				{onClose && (
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
				)}
				<Button
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
