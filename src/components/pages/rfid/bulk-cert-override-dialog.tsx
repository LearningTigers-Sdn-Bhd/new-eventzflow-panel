"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { bulkRfidCertOverride, getRfidEligibilityFields } from "@/lib/api/rfid";

const NEAR_MISS_PERCENTS = ["75", "70", "60", "50"];
const ALL = "all";
// Above this many values a dropdown is unwieldy, so the value is typed + searched.
const SEARCHABLE_OVER = 30;

type AttendedMode = "any" | "all" | "partial";
const ATTENDED_MODES: { value: AttendedMode; label: string; hint: string }[] = [
	{
		value: "any",
		label: "Came on at least one day",
		hint: "One day or more. Guests who never came are left out.",
	},
	{
		value: "all",
		label: "Came on every day",
		hint: "Showed up on each ticked day.",
	},
	{
		value: "partial",
		label: "Came on some days only",
		hint: "Came on one day but missed another (e.g. day 1 yes, day 2 no).",
	},
];

// Local calendar day, so sessions on the same date group together.
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
const dayLabel = (iso: string) =>
	new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});

type FieldFilter = { key: string; values: string[] };

// "nama_agensi" -> "Nama agensi"
const fieldLabel = (key: string) => {
	const spaced = key.replace(/_/g, " ").trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Waives the session attendance rule for many guests at once. Settings on the
 * left (who, ticket type, registration answers like category or agency, one
 * shared reason); the guests it would touch update live on the right. Each
 * guest still gets their own audited record and can be un-waived individually.
 * Guests already waived or already past the rule are skipped, and feedback is
 * still required.
 */
export function BulkCertOverrideDialog({
	eventId,
	open,
	ticketTypes,
	sessions,
	onClose,
}: {
	eventId: string;
	open: boolean;
	ticketTypes: { id: number; name: string }[];
	sessions: { id: number; name: string; starts_at: string }[];
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const [reason, setReason] = useState("");
	const [who, setWho] = useState<"all" | "near" | "attended">("all");
	const nearMiss = who === "near";
	const attendedOnly = who === "attended";
	const [attendedMode, setAttendedMode] = useState<AttendedMode>("any");
	// null = every day ticked (the default).
	const [pickedDays, setPickedDays] = useState<string[] | null>(null);
	const [minPercent, setMinPercent] = useState(NEAR_MISS_PERCENTS[0]);
	const [ticketTypeId, setTicketTypeId] = useState(ALL);
	const [fieldFilters, setFieldFilters] = useState<FieldFilter[]>([]);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search.trim());

	const fieldsQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "eligibility-fields"],
		queryFn: () => getRfidEligibilityFields(eventId),
		enabled: open,
	});
	const fields = fieldsQuery.data?.fields ?? [];

	const customFields = Object.fromEntries(
		fieldFilters
			.filter((f) => f.key && f.values.length)
			.map((f) => [f.key, f.values]),
	);
	// The search box only narrows the preview; it also narrows who is waived, so
	// what you see on the right is exactly who gets waived.
	const days = [
		...Map.groupBy(
			[...sessions].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
			(session) => dayKey(session.starts_at),
		),
	].map(([key, list]) => ({
		key,
		label: dayLabel(list[0].starts_at),
		ids: list.map((session) => session.id),
		names: list.map((session) => session.name).join(", "),
	}));
	const tickedDays = days.filter((day) =>
		(pickedDays ?? days.map((d) => d.key)).includes(day.key),
	);
	const payload = {
		min_percent: nearMiss ? minPercent : undefined,
		// Held back: guests who attended none of the ticked sessions.
		attended_days:
			attendedOnly && tickedDays.length
				? tickedDays.map((day) => day.ids)
				: undefined,
		attended_mode: attendedOnly && tickedDays.length ? attendedMode : undefined,
		ticket_type_id: ticketTypeId === ALL ? undefined : ticketTypeId,
		custom_fields: Object.keys(customFields).length ? customFields : undefined,
		q: deferredSearch || undefined,
	};

	const preview = useQuery({
		queryKey: ["event", eventId, "rfid", "bulk-override-preview", payload],
		queryFn: () => bulkRfidCertOverride(eventId, { ...payload, dry_run: true }),
		enabled: open,
		placeholderData: (previous) => previous,
	});
	const count = preview.data?.count ?? 0;
	const guests = preview.data?.guests ?? [];

	const waive = useMutation({
		mutationFn: () =>
			bulkRfidCertOverride(eventId, { ...payload, reason: reason.trim() }),
		onSuccess: (res) => {
			toast.success(
				`Waived attendance for ${res.count} guest${res.count === 1 ? "" : "s"}.`,
			);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "certificate-participants"],
			});
			onClose();
		},
		onError: (e) => toast.error(e.message),
	});

	const updateFilter = (index: number, patch: Partial<FieldFilter>) =>
		setFieldFilters((prev) =>
			prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
		);
	const usedKeys = new Set(fieldFilters.map((f) => f.key));

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 !p-0 !gap-0 flex flex-col bg-background shadow-none duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Bulk attendance waiver</DialogTitle>
						<DialogDescription>
							Choose who to waive on the left; the guests it applies to are
							listed on the right. Guests already waived or already past the
							attendance rule are skipped. They still need to submit the
							evaluation form to qualify.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
					<div className="flex w-full flex-none flex-col gap-6 overflow-y-auto border-r p-6 lg:w-[420px]">
						<div className="space-y-2">
							<Label>Who</Label>
							<RadioGroup
								value={who}
								onValueChange={(v) => setWho(v as typeof who)}
								className="gap-2"
							>
								<label
									htmlFor="bulk-who-all"
									className="flex cursor-pointer items-center gap-2 border p-3 text-sm"
								>
									<RadioGroupItem id="bulk-who-all" value="all" />
									Everyone who missed the attendance rule
								</label>
								<label
									htmlFor="bulk-who-near"
									className="flex cursor-pointer flex-wrap items-center gap-2 border p-3 text-sm"
								>
									<RadioGroupItem id="bulk-who-near" value="near" />
									Only close to passing: every session at least
									<Select
										value={minPercent}
										onValueChange={setMinPercent}
										disabled={!nearMiss}
									>
										<SelectTrigger className="h-8 w-20 rounded-none">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{NEAR_MISS_PERCENTS.map((value) => (
												<SelectItem key={value} value={value}>
													{value}%
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</label>
								<div className="space-y-3 border p-3 text-sm">
									<label
										htmlFor="bulk-who-attended"
										className="flex cursor-pointer items-start gap-2"
									>
										<RadioGroupItem
											id="bulk-who-attended"
											value="attended"
											className="mt-0.5"
										/>
										<span>
											Only guests by attendance
											<span className="block text-muted-foreground text-xs">
												Pick by event day. Being inside at any time during a
												day's sessions counts as coming that day.
											</span>
										</span>
									</label>
									<div className="space-y-3 pl-6">
										<div className="space-y-2">
											<p className="font-medium text-xs">
												Event days that count
											</p>
											{days.map((day) => (
												<label
													key={day.key}
													htmlFor={`bulk-day-${day.key}`}
													className="flex cursor-pointer items-start gap-2"
												>
													<Checkbox
														id={`bulk-day-${day.key}`}
														className="mt-0.5"
														disabled={!attendedOnly}
														checked={tickedDays.some((d) => d.key === day.key)}
														onCheckedChange={(checked) =>
															setPickedDays(
																checked
																	? [...tickedDays.map((d) => d.key), day.key]
																	: tickedDays
																			.map((d) => d.key)
																			.filter((key) => key !== day.key),
															)
														}
													/>
													<span>
														{day.label}
														<span className="block text-muted-foreground text-xs">
															{day.names}
														</span>
													</span>
												</label>
											))}
										</div>
										<RadioGroup
											value={attendedMode}
											onValueChange={(v) => setAttendedMode(v as AttendedMode)}
											disabled={!attendedOnly}
											className="gap-2"
										>
											<p className="font-medium text-xs">Guest must have</p>
											{ATTENDED_MODES.map((mode) => (
												<label
													key={mode.value}
													htmlFor={`bulk-mode-${mode.value}`}
													className="flex cursor-pointer items-start gap-2"
												>
													<RadioGroupItem
														id={`bulk-mode-${mode.value}`}
														value={mode.value}
														disabled={mode.value !== "any" && days.length < 2}
														className="mt-0.5"
													/>
													<span>
														{mode.label}
														<span className="block text-muted-foreground text-xs">
															{mode.value !== "any" && days.length < 2
																? "Needs an event with more than one day."
																: mode.hint}
														</span>
													</span>
												</label>
											))}
										</RadioGroup>
									</div>
								</div>
							</RadioGroup>
						</div>

						<div className="space-y-2">
							<Label>Narrow down (optional)</Label>
							<Select value={ticketTypeId} onValueChange={setTicketTypeId}>
								<SelectTrigger className="w-full rounded-none">
									<SelectValue placeholder="All ticket types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All ticket types</SelectItem>
									{ticketTypes.map((type) => (
										<SelectItem key={type.id} value={String(type.id)}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{fieldFilters.map((filter, index) => {
								const options =
									fields.find((f) => f.key === filter.key)?.values ?? [];
								return (
									<div
										key={filter.key || `new-${index}`}
										className="space-y-2 border p-2"
									>
										<div className="flex items-center gap-2">
											<Select
												value={filter.key}
												onValueChange={(key) =>
													updateFilter(index, { key, values: [] })
												}
											>
												<SelectTrigger className="w-full rounded-none">
													<SelectValue placeholder="Registration field" />
												</SelectTrigger>
												<SelectContent>
													{fields
														.filter(
															(f) =>
																f.key === filter.key || !usedKeys.has(f.key),
														)
														.map((f) => (
															<SelectItem key={f.key} value={f.key}>
																{fieldLabel(f.key)}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
											<Button
												variant="outline"
												size="icon-sm"
												className="h-9 w-9 shrink-0 rounded-none"
												title="Remove filter"
												onClick={() =>
													setFieldFilters((prev) =>
														prev.filter((_, i) => i !== index),
													)
												}
											>
												<X className="size-4" />
											</Button>
										</div>
										{options.length > SEARCHABLE_OVER ? (
											// Long lists (e.g. hundreds of agency names): type to search.
											<>
												<Input
													list={`bulk-values-${index}`}
													className="rounded-none"
													placeholder={`Type to search ${options.length} values…`}
													value={filter.values[0] ?? ""}
													disabled={!filter.key}
													onChange={(e) =>
														updateFilter(index, {
															values: e.target.value ? [e.target.value] : [],
														})
													}
												/>
												<datalist id={`bulk-values-${index}`}>
													{options.map((value) => (
														<option key={value} value={value} />
													))}
												</datalist>
											</>
										) : (
											<MultiSelect
												value={filter.values}
												onValueChange={(values) =>
													updateFilter(index, { values })
												}
											>
												<MultiSelectTrigger
													className="rounded-none"
													disabled={!filter.key}
												>
													<MultiSelectValue placeholder="Value (pick one or more)" />
												</MultiSelectTrigger>
												<MultiSelectContent>
													{options.map((value) => (
														<MultiSelectItem key={value} value={value}>
															{value}
														</MultiSelectItem>
													))}
												</MultiSelectContent>
											</MultiSelect>
										)}
									</div>
								);
							})}
							{fields.length > fieldFilters.length && (
								<Button
									variant="outline"
									size="sm"
									className="rounded-none"
									onClick={() =>
										setFieldFilters((prev) => [
											...prev,
											{ key: "", values: [] },
										])
									}
								>
									<Plus className="size-4" />
									Filter by registration field
								</Button>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="bulk-override-reason">Reason (required)</Label>
							<Textarea
								id="bulk-override-reason"
								className="rounded-none"
								placeholder="e.g. gate scanner lag, approved by organizer"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>

						<div className="mt-auto flex flex-col gap-2">
							<Button
								className="w-full rounded-none"
								disabled={!reason.trim() || count === 0 || waive.isPending}
								onClick={() => waive.mutate()}
							>
								{waive.isPending ? (
									<Loader2 className="mr-2 size-4 animate-spin" />
								) : (
									<ShieldCheck className="mr-2 size-4" />
								)}
								{waive.isPending
									? "Waiving…"
									: `Waive attendance for ${count} guests`}
							</Button>
							<Button
								variant="outline"
								className="w-full rounded-none"
								onClick={onClose}
							>
								Cancel
							</Button>
						</div>
					</div>

					<div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted/10 p-6 lg:p-8">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-3 text-sm">
								<Badge variant="secondary" className="rounded-none">
									{count} guest{count === 1 ? "" : "s"} will be waived
								</Badge>
								{preview.isFetching && (
									<Loader2 className="size-4 animate-spin text-muted-foreground" />
								)}
							</div>
							<Input
								placeholder="Search name, email, phone or ticket ID..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="max-w-xs rounded-none bg-background"
							/>
						</div>

						{preview.error ? (
							<p className="text-destructive text-sm">
								{preview.error.message}
							</p>
						) : guests.length === 0 && !preview.isFetching ? (
							<div className="border bg-background p-6 text-muted-foreground text-sm">
								No guests match these settings.
							</div>
						) : (
							<div className="border bg-background">
								<table className="w-full text-sm">
									<thead className="border-b text-left text-muted-foreground">
										<tr>
											<th className="px-3 py-2 font-medium">Guest</th>
											<th className="px-3 py-2 font-medium">Ticket type</th>
											<th className="px-3 py-2 font-medium">Lowest session</th>
											<th className="px-3 py-2 font-medium">Evaluation form</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{guests.map((guest) => (
											<tr key={guest.id}>
												<td className="px-3 py-2">
													<div className="font-medium">{guest.ticket_name}</div>
													<div className="text-muted-foreground text-xs">
														{guest.ticket_public_id}
													</div>
												</td>
												<td className="px-3 py-2">
													{guest.ticket_type ?? "—"}
												</td>
												<td className="px-3 py-2 tabular-nums">
													{guest.lowest_percent.toFixed(2)}%
												</td>
												<td className="px-3 py-2">
													{guest.feedback_submitted ? "Submitted" : "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						{preview.data?.limit && count > preview.data.limit && (
							<p className="text-muted-foreground text-xs">
								Showing the first {preview.data.limit} of {count}. All {count}{" "}
								will be waived.
							</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
