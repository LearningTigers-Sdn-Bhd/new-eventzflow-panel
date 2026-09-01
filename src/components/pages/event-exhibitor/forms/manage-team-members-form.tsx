"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	DollarSign,
	Info,
	Loader2,
	Plus,
	RefreshCw,
	Trash2,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { EventVendor } from "@/lib/api/event-vendor";
import { getEventVendors } from "@/lib/api/event-vendor";
import {
	resyncExhibitorKitTeamMembers,
	updateExhibitorKit,
} from "@/lib/api/exhibitor-kit";
import type { ExhibitorTeamMember } from "@/lib/api/exhibitor-kit/response";
import { getExhibitorTeamMemberLimit } from "@/lib/api/exhibitor-team-member-limit";

interface ManageTeamMembersFormProps {
	vendor: EventVendor;
	kitId: number;
	onClose?: () => void;
}

interface TeamMemberInput {
	id?: number;
	full_name: string;
	email: string;
	phone: string;
	_destroy?: boolean;
}

interface VisibleTeamMemberEntry {
	member: TeamMemberInput;
	index: number;
	displayIndex: number;
}

interface VisibleTeamMemberSections {
	visibleMembers: TeamMemberInput[];
	freeMembers: VisibleTeamMemberEntry[];
	paidMembers: VisibleTeamMemberEntry[];
}

interface TeamMemberSyncOptions {
	isDirty: boolean;
	currentMembers: TeamMemberInput[];
	incomingMembers: TeamMemberInput[];
}

interface RawTeamMemberInput {
	id?: number;
	full_name?: string | null;
	email?: string | null;
	phone?: string | null;
	_destroy?: boolean;
}

export function normalizeTeamMemberInput(
	member: RawTeamMemberInput,
): TeamMemberInput {
	return {
		id: member.id,
		full_name: member.full_name ?? "",
		email: member.email ?? "",
		phone: member.phone ?? "",
		_destroy: member._destroy ?? false,
	};
}

export function buildTeamMemberPayload(members: RawTeamMemberInput[]) {
	return members.map((member) => {
		const normalized = normalizeTeamMemberInput(member);

		return {
			id: normalized.id,
			full_name: normalized.full_name.trim(),
			email: normalized.email.trim(),
			phone: normalized.phone.trim(),
			_destroy: normalized._destroy,
		};
	});
}

export function getEventVendorsQueryKey(eventId: number) {
	return ["event", eventId.toString(), "vendors"] as const;
}

export function getInvalidActiveMemberIndexes(members: RawTeamMemberInput[]) {
	return members.reduce<number[]>((indexes, member, index) => {
		const normalized = normalizeTeamMemberInput(member);

		if (normalized._destroy) return indexes;

		// Email/phone are optional (fast on-site registration); name is the only
		// required field, matching the backend's ExhibitorTeamMember validation.
		const isComplete = normalized.full_name.trim().length > 0;

		if (!isComplete) indexes.push(index);

		return indexes;
	}, []);
}

export function getVisibleTeamMemberSections(
	members: TeamMemberInput[],
	limit: number | null,
): VisibleTeamMemberSections {
	const visibleEntries = members.reduce<VisibleTeamMemberEntry[]>(
		(entries, member, index) => {
			if (member._destroy) return entries;

			entries.push({
				member,
				index,
				displayIndex: entries.length + 1,
			});

			return entries;
		},
		[],
	);

	const freeCount = limit ?? visibleEntries.length;

	return {
		visibleMembers: visibleEntries.map((entry) => entry.member),
		freeMembers: visibleEntries.filter(
			(entry) => entry.displayIndex <= freeCount,
		),
		paidMembers: visibleEntries.filter(
			(entry) => entry.displayIndex > freeCount,
		),
	};
}

export function shouldSyncTeamMembers({
	isDirty,
	currentMembers,
	incomingMembers,
}: TeamMemberSyncOptions) {
	if (!isDirty) return true;

	if (currentMembers.length === 0 && incomingMembers.length === 0) return true;

	return false;
}

export function hasConfiguredTeamMemberLimit(limit: number | null | undefined) {
	return limit !== null && limit !== undefined;
}

export function resolveCurrentVendor(
	initialVendor: EventVendor,
	kitId: number,
	vendors?: EventVendor[],
) {
	const freshVendor = vendors?.find((vendor) => vendor.id === initialVendor.id);

	if (!freshVendor) return initialVendor;

	const initialMembers =
		initialVendor.exhibitor_kits.find((kit) => kit.id === kitId)
			?.exhibitor_team_members.length ?? 0;
	const freshMembers =
		freshVendor.exhibitor_kits.find((kit) => kit.id === kitId)
			?.exhibitor_team_members.length ?? 0;
	const initialUpdatedAt = initialVendor.updated_at
		? Date.parse(initialVendor.updated_at)
		: Number.NaN;
	const freshUpdatedAt = freshVendor.updated_at
		? Date.parse(freshVendor.updated_at)
		: Number.NaN;
	const hasNewerFreshVendor =
		Number.isFinite(initialUpdatedAt) &&
		Number.isFinite(freshUpdatedAt) &&
		freshUpdatedAt > initialUpdatedAt;

	if (initialMembers > 0 && freshMembers === 0 && !hasNewerFreshVendor) {
		return initialVendor;
	}

	return freshVendor;
}

export function ManageTeamMembersForm({
	vendor: initialVendor,
	kitId,
	onClose,
}: ManageTeamMembersFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const vendorsQueryKey = getEventVendorsQueryKey(eventId);
	const { data: vendors } = useQuery({
		queryKey: vendorsQueryKey,
		queryFn: () => getEventVendors(initialVendor.event_id),
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
	});
	const vendor = resolveCurrentVendor(initialVendor, kitId, vendors);
	const kit = vendor.exhibitor_kits.find((candidate) => candidate.id === kitId);

	const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([]);
	const [hasLocalChanges, setHasLocalChanges] = useState(false);
	const hydratedKitIdRef = useRef<number | undefined>(undefined);
	const serverTeamMembers = useMemo(
		() =>
			kit?.exhibitor_team_members?.map((member: ExhibitorTeamMember) =>
				normalizeTeamMemberInput(member),
			) || [],
		[kit?.exhibitor_team_members],
	);

	useEffect(() => {
		const kitIdChanged = hydratedKitIdRef.current !== kit?.id;

		if (kitIdChanged) {
			hydratedKitIdRef.current = kit?.id;
			setTeamMembers(serverTeamMembers);
			setHasLocalChanges(false);
			return;
		}

		if (!hasLocalChanges) {
			setTeamMembers(serverTeamMembers);
		}
	}, [hasLocalChanges, kit?.id, serverTeamMembers]);
	const [newMemberName, setNewMemberName] = useState("");
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberPhone, setNewMemberPhone] = useState("");

	const queryClient = useQueryClient();

	// Fetch team member limit settings
	const { data: limitSettings, isLoading: isLimitLoading } = useQuery({
		queryKey: ["exhibitor-team-member-limit", eventId],
		queryFn: () => getExhibitorTeamMemberLimit(eventId),
		retry: false,
	});

	const updateKitMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) => {
			if (!kit?.id) throw new Error("No exhibitor kit found");

			return updateExhibitorKit(eventId, kit.id, data);
		},
		onSuccess: () => {
			setHasLocalChanges(false);
			toast.success("Team members updated successfully!");
			queryClient.invalidateQueries({
				queryKey: vendorsQueryKey,
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update team members");
			// The save may have partially landed server-side even though this
			// request errored (e.g. the member row committed before a later step
			// failed) — resync from the server instead of leaving local state
			// pointing at members that no longer look "new" to the backend, which
			// would otherwise re-create them as duplicates on the next retry.
			queryClient.invalidateQueries({ queryKey: vendorsQueryKey });
		},
	});

	// Company name only gets copied onto a member's ticket at the moment the
	// ticket is created/synced — if the kit's company name is corrected
	// afterward, already-issued tickets keep the stale value until this runs.
	const resyncMutation = useMutation({
		mutationFn: () => {
			if (!kit?.id) throw new Error("No exhibitor kit found");

			return resyncExhibitorKitTeamMembers(eventId, kit.id);
		},
		onSuccess: ({ updated, unchanged, skipped, failed }) => {
			if (failed.length > 0) {
				const detail = failed
					.map((f) => `${f.full_name}${f.reason ? ` (${f.reason})` : ""}`)
					.join(", ");
				toast.error(
					`Resynced ${updated.length} ticket(s), but ${failed.length} failed: ${detail}`,
				);
				return;
			}

			if (updated.length > 0) {
				const skippedNote = skipped.length
					? ` ${skipped.length} skipped (no company name or no ticket yet).`
					: "";
				toast.success(
					`Resynced company name on ${updated.length} member ticket${
						updated.length === 1 ? "" : "s"
					}.${skippedNote}`,
				);
				return;
			}

			if (unchanged.length > 0) {
				toast.success(
					"All member tickets already match the current company name.",
				);
				return;
			}

			const reason =
				skipped.find((s) => s.reason)?.reason ??
				"no team members with a linked ticket";
			toast.info(`Nothing to resync — ${reason}.`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to resync team members");
		},
	});

	const handleAddMember = () => {
		if (!newMemberName.trim()) {
			toast.error("Please enter a name");
			return;
		}
		setHasLocalChanges(true);
		setTeamMembers([
			...teamMembers,
			{
				full_name: newMemberName.trim(),
				email: newMemberEmail.trim(),
				phone: newMemberPhone.trim(),
			},
		]);
		setNewMemberName("");
		setNewMemberEmail("");
		setNewMemberPhone("");
	};

	const handleRemoveMember = (index: number) => {
		const member = teamMembers[index];
		setHasLocalChanges(true);
		if (member.id) {
			setTeamMembers(
				teamMembers.map((m, i) => (i === index ? { ...m, _destroy: true } : m)),
			);
		} else {
			setTeamMembers(teamMembers.filter((_, i) => i !== index));
		}
	};

	const handleUpdateMember = (
		index: number,
		field: keyof TeamMemberInput,
		value: string,
	) => {
		setHasLocalChanges(true);
		setTeamMembers(
			teamMembers.map((member, i) =>
				i === index ? { ...member, [field]: value } : member,
			),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!kit) {
			toast.error("No exhibitor kit found");
			return;
		}

		const invalidIndexes = getInvalidActiveMemberIndexes(teamMembers);

		if (invalidIndexes.length > 0) {
			const rows = invalidIndexes.map((index) => index + 1).join(", ");
			toast.error(`Please enter a name for row(s): ${rows}`);
			return;
		}

		const payloadMembers = teamMembers
			.map((member) => normalizeTeamMemberInput(member))
			.filter(
				(member) =>
					member._destroy ||
					member.full_name.trim().length > 0 ||
					member.email.trim().length > 0 ||
					member.phone.trim().length > 0,
			);

		await updateKitMutation.mutateAsync({
			exhibitor_team_members_attributes: buildTeamMemberPayload(payloadMembers),
		});
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	if (isLimitLoading) {
		return (
			<section className="w-full px-8">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="size-5 animate-spin text-muted-foreground" />
				</div>
			</section>
		);
	}

	const { visibleMembers, freeMembers, paidMembers } =
		getVisibleTeamMemberSections(
			teamMembers,
			limitSettings?.team_member_limit ?? null,
		);
	const currentCount = visibleMembers.length;

	// Calculate limit status (only derive limit once it's loaded to prevent grey→green flash)
	const limit = isLimitLoading
		? null
		: (limitSettings?.team_member_limit ?? null);
	const hasLimit = !isLimitLoading && hasConfiguredTeamMemberLimit(limit);
	const fee = limitSettings?.extra_team_member_fee
		? Number.parseFloat(limitSettings.extra_team_member_fee)
		: 0;

	const freeSlots = hasLimit ? Math.max((limit || 0) - currentCount, 0) : null;
	const excessCount = hasLimit ? Math.max(currentCount - (limit || 0), 0) : 0;
	const extraCharges = excessCount * fee;
	const isOverLimit = hasLimit && currentCount > (limit || 0);
	const isAtLimit = hasLimit && currentCount === limit;
	const canAddMore = !hasLimit || currentCount < (limit || 0) || fee > 0;

	const renderMemberCard = (
		entry: VisibleTeamMemberEntry,
		options: {
			containerClassName: string;
			indexClassName: string;
			feeLabel?: string;
		},
	) => (
		<div
			key={entry.member.id || `new-${entry.index}`}
			className={options.containerClassName}
		>
			<span className={options.indexClassName}>#{entry.displayIndex}</span>
			<div className="grid min-w-0 flex-1 gap-2 lg:grid-cols-3">
				<Input
					value={entry.member.full_name}
					onChange={(e) =>
						handleUpdateMember(entry.index, "full_name", e.target.value)
					}
					disabled={updateKitMutation.isPending}
					className="min-w-0 rounded-none"
				/>
				<Input
					type="email"
					value={entry.member.email}
					onChange={(e) =>
						handleUpdateMember(entry.index, "email", e.target.value)
					}
					disabled={updateKitMutation.isPending}
					className="min-w-0 rounded-none"
				/>
				<Input
					value={entry.member.phone}
					onChange={(e) =>
						handleUpdateMember(entry.index, "phone", e.target.value)
					}
					disabled={updateKitMutation.isPending}
					className="min-w-0 rounded-none"
				/>
			</div>
			{options.feeLabel ? (
				<span className="shrink-0 whitespace-nowrap font-medium text-amber-600 text-xs dark:text-amber-400">
					{options.feeLabel}
				</span>
			) : null}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={() => handleRemoveMember(entry.index)}
				disabled={updateKitMutation.isPending}
				className="shrink-0 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);

	return (
		<section className="w-full px-8">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					{/* Limit Status Banner - Mobile Responsive */}
					{hasLimit && (
						<div className="border border-dashed bg-muted/50 p-3">
							<div className="flex items-start gap-3">
								<Info className="mt-0.5 size-4 shrink-0 text-primary" />
								<div className="flex-1 space-y-3">
									{/* Limit and Current Info - Stacked on mobile, row on desktop */}
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
										<div className="flex-1">
											<p className="font-medium text-sm">
												Team Member Limit: {limit}
											</p>
											<p className="text-muted-foreground text-xs">
												{freeSlots !== null && freeSlots > 0
													? `${freeSlots} free slot${freeSlots !== 1 ? "s" : ""} remaining`
													: "No free slots remaining"}
											</p>
										</div>
										<div className="flex-1 sm:border-l sm:pl-4">
											<p className="font-medium text-sm">
												Current: {currentCount}
											</p>
											{fee > 0 && (
												<p className="text-muted-foreground text-xs">
													Extra fee: RM {fee.toFixed(2)}/member
												</p>
											)}
										</div>
									</div>

									{/* Warning/Error Badges */}
									{isOverLimit && fee > 0 && (
										<div className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-100 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/40">
											<DollarSign className="size-4 shrink-0 text-amber-600 dark:text-amber-300" />
											<div className="min-w-0 flex-1">
												<p className="font-semibold text-amber-900 text-xs dark:text-amber-100">
													{excessCount} excess member
													{excessCount !== 1 ? "s" : ""}
												</p>
												<p className="text-amber-900 text-xs dark:text-amber-100">
													Additional charge: RM {extraCharges.toFixed(2)}
												</p>
											</div>
										</div>
									)}

									{isAtLimit && fee === 0 && (
										<div className="flex items-center gap-2 rounded-none border border-red-200 bg-red-100 px-3 py-2 dark:border-red-800 dark:bg-red-950/40">
											<AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-300" />
											<p className="font-semibold text-red-900 text-xs dark:text-red-100">
												Limit reached. Cannot add more team members.
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					<FieldSeparator />
					<FieldGroup>
						{/* Add Member Input */}
						<div className="space-y-2">
							<p className="font-medium text-sm">Add New Team Member</p>
							<p className="text-muted-foreground text-xs">
								Use the member&apos;s real email address so they can receive
								their QR code.
							</p>
							<div className="grid gap-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
								<Input
									value={newMemberName}
									onChange={(e) => setNewMemberName(e.target.value)}
									placeholder="Enter team member name"
									disabled={updateKitMutation.isPending || !canAddMore}
									className="flex-1 rounded-none"
								/>
								<Input
									type="email"
									value={newMemberEmail}
									onChange={(e) => setNewMemberEmail(e.target.value)}
									placeholder="Email address"
									disabled={updateKitMutation.isPending || !canAddMore}
									className="rounded-none"
								/>
								<Input
									value={newMemberPhone}
									onChange={(e) => setNewMemberPhone(e.target.value)}
									placeholder="Phone number"
									disabled={updateKitMutation.isPending || !canAddMore}
									className="rounded-none"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddMember();
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleAddMember}
									disabled={updateKitMutation.isPending || !canAddMore}
									className="rounded-none"
								>
									<Plus className="mr-2 size-4" />
									Add
								</Button>
							</div>
							{!canAddMore && (
								<p className="flex items-center gap-1 text-red-500 text-xs">
									<AlertCircle className="size-3" />
									Cannot add more members. Limit reached and no extra fee
									configured.
								</p>
							)}
						</div>

						<FieldSeparator />

						{/* Team Members List */}
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-2">
								<p className="flex items-center gap-2 font-medium text-sm">
									<Users className="size-4" />
									Team Members ({visibleMembers.length})
								</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => resyncMutation.mutate()}
									disabled={
										resyncMutation.isPending ||
										updateKitMutation.isPending ||
										visibleMembers.length === 0
									}
									className="rounded-none"
									title="Re-apply the current company name to every team member's ticket"
								>
									<RefreshCw
										className={`mr-2 size-4 ${resyncMutation.isPending ? "animate-spin" : ""}`}
									/>
									{resyncMutation.isPending ? "Resyncing..." : "Resync Members"}
								</Button>
							</div>

							{visibleMembers.length === 0 ? (
								<div className="rounded-none border border-dashed py-8 text-center text-muted-foreground">
									No team members added yet.
								</div>
							) : hasLimit ? (
								// Show separated sections when limit exists
								<div className="space-y-4">
									{/* Free Team Members Section */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Free Team Members
											</p>
											<span className="font-medium text-green-600 text-xs dark:text-green-400">
												{Math.min(currentCount, limit || 0)} / {limit}
											</span>
										</div>
										<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
											{freeMembers.map((entry) =>
												renderMemberCard(entry, {
													containerClassName:
														"flex items-center gap-2 rounded-none border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20",
													indexClassName:
														"shrink-0 font-medium text-green-600 text-xs dark:text-green-400",
												}),
											)}
										</div>
									</div>

									{/* Paid Team Members Section */}
									{paidMembers.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
													Additional Team Members — Extra Fee
												</p>
												<span className="font-medium text-amber-600 text-xs dark:text-amber-400">
													{excessCount} × RM {fee.toFixed(2)} = RM{" "}
													{extraCharges.toFixed(2)}
												</span>
											</div>
											<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
												{paidMembers.map((entry) =>
													renderMemberCard(entry, {
														containerClassName:
															"flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20",
														indexClassName:
															"shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400",
														feeLabel: `+${fee.toFixed(0)}`,
													}),
												)}
											</div>
										</div>
									)}
								</div>
							) : (
								// Show simple grid when no limit
								<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
									{freeMembers.map((entry) =>
										renderMemberCard(entry, {
											containerClassName:
												"flex items-center gap-2 rounded-none border bg-muted/30 p-2",
											indexClassName:
												"shrink-0 font-medium text-muted-foreground text-xs",
										}),
									)}
								</div>
							)}
						</div>

						<FieldSeparator />

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateKitMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateKitMutation.isPending}>
								{updateKitMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
