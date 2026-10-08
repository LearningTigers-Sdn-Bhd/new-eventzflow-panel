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
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	type CertificateAudience,
	type CertificateParticipant,
	getCertificateParticipants,
	sendCertificates,
} from "@/lib/api/certificate";
import { getRfidEligibilityFields } from "@/lib/api/rfid";
import { cn } from "@/lib/utils";

type Audience = CertificateAudience;

const NO_FIELD = "none";
// Rows drawn at once; thousands of checkboxes make the modal sluggish.
// "Select all" still covers every matching row.
const RENDER_LIMIT = 200;
// Above this many values a dropdown is unwieldy, so the value is typed + searched.
const SEARCHABLE_OVER = 30;

const AUDIENCES: { value: Audience; label: string; hint: string }[] = [
	{
		value: "rfid_qualified",
		label: "Finished all sessions and feedback",
		hint: "Both required",
	},
	{
		value: "sessions_or_feedback",
		label: "Finished all sessions or feedback",
		hint: "Either one is enough",
	},
	{
		value: "sessions_done",
		label: "Finished all sessions only",
		hint: "Feedback not needed",
	},
	{
		value: "feedback_submitted",
		label: "Submitted feedback only",
		hint: "Sessions not checked",
	},
	{ value: "all", label: "All ticket holders", hint: "No attendance check" },
	{
		value: "checked_in",
		label: "Only checked-in",
		hint: "No attendance check",
	},
];

// Same solid square badge the Certificate status column uses.
const BADGE =
	"rounded-none border-transparent px-2 py-0.5 font-bold text-white text-xs";

// "nama_agensi" -> "Nama agensi"
const fieldLabel = (key: string) => {
	const spaced = key.replace(/_/g, " ").trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

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
	// Narrow by a registration answer, e.g. category 2, 3 and 4 only. Empty
	// value set = no narrowing.
	const [fieldKey, setFieldKey] = useState(NO_FIELD);
	const [fieldValues, setFieldValues] = useState<Set<string>>(new Set());
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();

	const { data: fieldsData } = useQuery({
		queryKey: ["event", eventId, "rfid", "eligibility-fields"],
		queryFn: () => getRfidEligibilityFields(eventId),
	});
	const fields = fieldsData?.fields ?? [];
	const fieldOptions = fields.find((f) => f.key === fieldKey)?.values ?? [];

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
			if (
				fieldKey !== NO_FIELD &&
				fieldValues.size > 0 &&
				!fieldValues.has(p.custom_fields?.[fieldKey] ?? "")
			) {
				return false;
			}
			return true;
		});
	}, [participants, audience, skipSent, fieldKey, fieldValues]);

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
			// Backend expects exclusions: everyone who isn't both eligible (audience
			// + category filter) and explicitly selected. Counted over all
			// participants so a person selected under another filter is never sent.
			const recipients = new Set(
				eligible
					.filter((p) => selected.has(p.public_id))
					.map((p) => p.public_id),
			);
			const excludedPublicIds = (participants ?? [])
				.filter((p) => !recipients.has(p.public_id))
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

	const narrowed = fieldKey !== NO_FIELD;
	const narrowLabel = narrowed ? fieldLabel(fieldKey) : "";

	return (
		<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
			<div className="flex w-full flex-none flex-col gap-6 overflow-y-auto border-r p-6 lg:w-[420px]">
				<div className="space-y-2">
					<Label>Audience</Label>
					<RadioGroup
						value={audience}
						onValueChange={(v) => setAudience(v as Audience)}
						className="gap-2"
					>
						{AUDIENCES.map((item) => (
							<label
								key={item.value}
								htmlFor={`audience-${item.value}`}
								className="flex cursor-pointer items-start gap-2 rounded-none border p-3 text-sm"
							>
								<RadioGroupItem
									id={`audience-${item.value}`}
									value={item.value}
									className="mt-0.5"
								/>
								<span>
									{item.label}
									<span className="block text-muted-foreground text-xs">
										{item.hint}
									</span>
								</span>
							</label>
						))}
					</RadioGroup>
					<label
						htmlFor="skip-sent"
						className="flex cursor-pointer items-center gap-2 pt-1 text-sm"
					>
						<Checkbox
							id="skip-sent"
							checked={skipSent}
							onCheckedChange={(v) => setSkipSent(v === true)}
						/>
						Skip people who already received a certificate
					</label>
				</div>

				{fields.length > 0 && (
					<div className="space-y-2">
						<Label>Narrow down by registration field (optional)</Label>
						<Select
							value={fieldKey}
							onValueChange={(key) => {
								setFieldKey(key);
								setFieldValues(new Set());
							}}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NO_FIELD}>No narrowing</SelectItem>
								{fields.map((f) => (
									<SelectItem key={f.key} value={f.key}>
										{fieldLabel(f.key)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{narrowed &&
							(fieldOptions.length > SEARCHABLE_OVER ? (
								// Long lists (e.g. hundreds of agency names): type to search.
								<>
									<Input
										list="cert-field-values"
										className="rounded-none"
										placeholder={`Type to search ${fieldOptions.length} values…`}
										value={[...fieldValues][0] ?? ""}
										onChange={(e) =>
											setFieldValues(
												new Set(e.target.value ? [e.target.value] : []),
											)
										}
									/>
									<datalist id="cert-field-values">
										{fieldOptions.map((value) => (
											<option key={value} value={value} />
										))}
									</datalist>
								</>
							) : (
								<MultiSelect
									value={[...fieldValues]}
									onValueChange={(values) => setFieldValues(new Set(values))}
								>
									<MultiSelectTrigger className="rounded-none">
										<MultiSelectValue placeholder="Value (pick one or more)" />
									</MultiSelectTrigger>
									<MultiSelectContent>
										{fieldOptions.map((value) => (
											<MultiSelectItem key={value} value={value}>
												{value}
											</MultiSelectItem>
										))}
									</MultiSelectContent>
								</MultiSelect>
							))}
					</div>
				)}

				<div className="mt-auto flex flex-col gap-2">
					<Button
						className="w-full rounded-none"
						onClick={handleSend}
						disabled={sendMutation.isPending || recipientCount === 0}
					>
						{sendMutation.isPending
							? "Sending..."
							: `Send to ${recipientCount} selected`}
					</Button>
					{onClose && (
						<Button
							variant="outline"
							className="w-full rounded-none"
							onClick={onClose}
						>
							Cancel
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted/10 p-6 lg:p-8">
				<div className="flex flex-wrap items-center gap-2 text-sm">
					<Badge variant="secondary" className="rounded-none">
						{eligible.length} guest{eligible.length === 1 ? "" : "s"} match
					</Badge>
					<Badge variant="secondary" className="rounded-none">
						{recipientCount} selected
					</Badge>
				</div>
				<div className="flex items-center gap-3">
					<Input
						placeholder="Search name or email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="min-w-0 flex-1 rounded-none bg-background"
					/>
					{visible.length > 0 && (
						<label
							htmlFor="select-all-recipients"
							className="flex shrink-0 cursor-pointer items-center gap-2 rounded-none border bg-background px-3 py-2 text-sm"
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
					<div className="border bg-background">
						<table className="w-full text-sm">
							<thead className="border-b text-left text-muted-foreground">
								<tr>
									<th className="w-10 px-3 py-2" />
									<th className="px-3 py-2 font-medium">Guest</th>
									<th className="px-3 py-2 font-medium">Ticket type</th>
									{narrowed && (
										<th className="px-3 py-2 font-medium">{narrowLabel}</th>
									)}
									<th className="px-3 py-2 font-medium">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{visible.slice(0, RENDER_LIMIT).map((p) => {
									const alreadySent =
										p.certificate_status &&
										SENT_STATUSES.has(p.certificate_status);
									return (
										<tr key={p.public_id}>
											<td className="px-3 py-2">
												<Checkbox
													checked={selected.has(p.public_id)}
													onCheckedChange={() => toggle(p.public_id)}
												/>
											</td>
											<td className="px-3 py-2">
												<div className="font-medium">{p.attendee_name}</div>
												<div className="text-muted-foreground text-xs">
													{p.attendee_email}
												</div>
											</td>
											<td className="px-3 py-2">{p.ticket_type ?? "—"}</td>
											{narrowed && (
												<td className="px-3 py-2">
													{p.custom_fields?.[fieldKey] || "—"}
												</td>
											)}
											<td className="px-3 py-2">
												<div className="flex flex-wrap gap-1">
													{p.checked_in && (
														<Badge className={cn(BADGE, "bg-green-500")}>
															Checked in
														</Badge>
													)}
													{p.feedback_submitted && (
														<Badge className={cn(BADGE, "bg-blue-500")}>
															Feedback
														</Badge>
													)}
													{alreadySent && (
														<Badge className={cn(BADGE, "bg-cyan-500")}>
															Already sent
														</Badge>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{visible.length > RENDER_LIMIT && (
					<p className="text-muted-foreground text-xs">
						Showing the first {RENDER_LIMIT} of {visible.length}. Use search or
						the filters to narrow the list; "Select all" covers all{" "}
						{visible.length}.
					</p>
				)}
			</div>
		</div>
	);
}

export default SendCertificatesPanel;
