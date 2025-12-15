"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Info, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventVendors } from "@/lib/api/event-vendor";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { ExhibitorTeamMember } from "@/lib/api/exhibitor-kit/response";
import { getExhibitorTeamMemberLimit } from "@/lib/api/exhibitor-team-member-limit";

interface VendorTeamMembersPageProps {
	eventId: number;
	eventVendorId: number;
}

interface TeamMemberInput {
	id?: number;
	full_name: string;
	created_at?: string;
	_destroy?: boolean;
}

export function VendorTeamMembersPage({
	eventId,
	eventVendorId,
}: VendorTeamMembersPageProps) {
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();

	// Fetch vendor data
	const { data: vendors, isLoading: isLoadingVendor } = useQuery({
		queryKey: ["event", eventId.toString(), "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	const vendor = vendors?.find((v) => v.id === eventVendorId);
	const kit = vendor?.exhibitor_kit;

	// Fetch team member limit settings
	const { data: limitSettings, isLoading: isLoadingLimit } = useQuery({
		queryKey: ["exhibitor-team-member-limit", eventId],
		queryFn: () => getExhibitorTeamMemberLimit(eventId),
		retry: false,
	});

	const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([]);

	// Update team members when kit data loads - FIX: Use useEffect instead of useState
	useEffect(() => {
		if (kit?.exhibitor_team_members) {
			setTeamMembers(
				kit.exhibitor_team_members.map((m: ExhibitorTeamMember) => ({
					id: m.id,
					full_name: m.full_name,
					created_at: m.created_at,
					_destroy: false,
				})),
			);
		}
	}, [kit?.exhibitor_team_members]);

	const updateKitMutation = useMutation({
		mutationFn: async (data: {
			exhibitor_team_members_attributes: TeamMemberInput[];
		}) => {
			if (!kit) throw new Error("Exhibitor kit not found");
			return updateExhibitorKit(eventId, kit.id, data);
		},
		onSuccess: (_data, variables) => {
			// Check if it's a deletion or addition
			const hasDestroy = variables.exhibitor_team_members_attributes.some(
				(m) => m._destroy,
			);
			if (hasDestroy) {
				toast.success("Team member removed successfully!");
			} else {
				toast.success("Team member added successfully!");
			}
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update team members");
		},
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newMemberName, setNewMemberName] = useState("");

	const handleAddMember = () => {
		setIsAddDialogOpen(true);
		setNewMemberName("");
	};

	const handleConfirmAdd = async () => {
		if (!newMemberName.trim()) {
			toast.error("Please enter a name");
			return;
		}

		const updatedMembers = [
			...teamMembers,
			{ full_name: newMemberName.trim(), _destroy: false },
		];
		setTeamMembers(updatedMembers);
		setIsAddDialogOpen(false);
		setNewMemberName("");

		// Auto-save the new member
		try {
			await updateKitMutation.mutateAsync({
				exhibitor_team_members_attributes: updatedMembers
					.filter((m) => !m._destroy)
					.map((m) => ({
						id: m.id,
						full_name: m.full_name.trim(),
						_destroy: m._destroy,
					})),
			});
		} catch (_error) {
			// Revert on error
			setTeamMembers(teamMembers);
		}
	};

	const handleRemoveMember = (index: number, memberName: string) => {
		openConfirm({
			title: "Remove Team Member",
			description: "This action cannot be undone.",
			message: `Are you sure you want to remove "${memberName}" from your team?`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => {
				const member = teamMembers[index];
				if (member.id) {
					// Mark existing member for deletion and save immediately
					const updatedMembers = teamMembers.map((m, i) =>
						i === index ? { ...m, _destroy: true } : m,
					);
					setTeamMembers(updatedMembers);

					// Auto-save the deletion
					updateKitMutation.mutate({
						exhibitor_team_members_attributes: updatedMembers
							.filter((m) => m.id || !m._destroy)
							.map((m) => ({
								id: m.id,
								full_name: m.full_name.trim(),
								_destroy: m._destroy,
							})),
					});
				} else {
					// Remove new member from list (not yet saved)
					setTeamMembers(teamMembers.filter((_, i) => i !== index));
					toast.success("Team member removed");
				}
				closeDialog();
			},
		});
	};

	// Calculate values BEFORE any early returns (for hooks)
	const activeMembers = teamMembers.filter((m) => !m._destroy);
	const currentCount = activeMembers.length;
	const limit = limitSettings?.team_member_limit;
	const fee = limitSettings?.extra_team_member_fee
		? Number(limitSettings.extra_team_member_fee)
		: 0;

	const freeSlots = limit ? Math.max(limit - currentCount, 0) : null;
	const excessCount = limit && currentCount > limit ? currentCount - limit : 0;
	const totalCharges = excessCount * fee;

	const canAddMore = !limit || fee > 0 || currentCount < limit;

	// Set the "Add Member" button in the header - MUST be before any returns
	useSetEventActions(
		!isLoadingVendor && !isLoadingLimit && kit && canAddMore ? (
			<Button onClick={handleAddMember} className="rounded-none">
				<Plus className="mr-2 h-4 w-4" />
				Add Member
			</Button>
		) : null,
	);

	// Early returns for loading and no kit
	if (isLoadingVendor || isLoadingLimit) {
		return (
			<div className="space-y-6 px-2 py-6 md:px-4">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!kit) {
		return (
			<div className="space-y-6 p-0">
				<div className="border p-12 text-center">
					<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No Exhibitor Kit</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						You need to create an exhibitor kit first before adding team
						members.
					</p>
				</div>
			</div>
		);
	}

	const freeMembers = limit ? activeMembers.slice(0, limit) : activeMembers;
	const chargedMembers = limit ? activeMembers.slice(limit) : [];

	// Format date helper
	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-MY", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	return (
		<div className="space-y-6 p-0">
			{/* Summary Cards - Only show when there's a limit */}
			{limit && (
				<div className="grid gap-4 md:grid-cols-3">
					<div className="border p-4">
						<div className="mb-3">
							<h3 className="font-medium text-sm">Total Members</h3>
						</div>
						<div className="font-bold text-2xl">{currentCount}</div>
						<p className="text-muted-foreground text-xs">Limit: {limit}</p>
					</div>

					<div className="border p-4">
						<div className="mb-3">
							<h3 className="font-medium text-sm">Free Slots</h3>
						</div>
						<div className="font-bold text-2xl">
							{freeSlots !== null ? freeSlots : "N/A"}
						</div>
						<p className="text-muted-foreground text-xs">
							{freeMembers.length} / {limit} used
						</p>
					</div>

					{fee > 0 && (
						<div className="border p-4">
							<div className="mb-3">
								<h3 className="font-medium text-sm">Extra Charges</h3>
							</div>
							<div className="font-bold text-2xl">
								RM {totalCharges.toFixed(2)}
							</div>
							<p className="text-muted-foreground text-xs">
								{excessCount} × RM {fee.toFixed(2)}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Warning for exceeded limit */}
			{limit && currentCount > limit && fee > 0 && (
				<Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
					<AlertCircle className="h-4 w-4 text-amber-600" />
					<AlertDescription className="text-amber-600">
						You have {excessCount} team member{excessCount !== 1 ? "s" : ""}{" "}
						exceeding the free limit. Additional charges of RM{" "}
						{totalCharges.toFixed(2)} will apply.
					</AlertDescription>
				</Alert>
			)}

			{/* Info about limit */}
			{limit && fee === 0 && currentCount >= limit && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>
						You have reached the maximum team member limit ({limit}). No
						additional members can be added.
					</AlertDescription>
				</Alert>
			)}

			{/* Empty State */}
			{activeMembers.length === 0 && (
				<div className="border p-12 text-center">
					<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No Team Members Yet</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Add team members who will be attending the event
					</p>
				</div>
			)}

			{/* Team Members Table - Unified when no limit, separated when limit exists */}
			{!limit && activeMembers.length > 0 ? (
				// Unlimited - Single table without color
				<div className="border">
					<div className="border-b p-4">
						<h3 className="flex items-center gap-2 font-semibold text-lg">
							<Users className="h-5 w-5" />
							Team Members ({currentCount})
						</h3>
					</div>
					<div className="p-4">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="pb-3 text-left font-medium text-sm">No.</th>
										<th className="pb-3 text-left font-medium text-sm">
											Full Name
										</th>
										<th className="pb-3 text-left font-medium text-sm">
											Created At
										</th>
										<th className="pb-3 text-right font-medium text-sm">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{activeMembers.map((member, index) => (
										<tr
											key={member.id || `member-${index}`}
											className="border-b last:border-0"
										>
											<td className="py-3 text-sm">{index + 1}</td>
											<td className="py-3 font-medium text-sm">
												{member.full_name}
											</td>
											<td className="py-3 text-muted-foreground text-sm">
												{formatDate(member.created_at)}
											</td>
											<td className="py-3 text-right">
												<Button
													onClick={() => {
														const actualIndex = teamMembers.findIndex(
															(m) => m.id === member.id,
														);
														handleRemoveMember(actualIndex, member.full_name);
													}}
													size="sm"
													variant="ghost"
													className="text-destructive hover:bg-destructive/10 hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			) : (
				// With limit - Separate tables for free and charged
				<>
					{/* Free Members Table */}
					{freeMembers.length > 0 && (
						<div className="border">
							<div className="border-b p-4">
								<h3 className="flex items-center gap-2 font-semibold text-lg">
									<Users className="h-5 w-5 text-green-600" />
									<span className="text-green-600">
										Free Members ({freeMembers.length})
									</span>
									{limit && (
										<span className="font-normal text-muted-foreground text-sm">
											/ {limit} allocated
										</span>
									)}
								</h3>
							</div>
							<div className="p-4">
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="pb-3 text-left font-medium text-sm">
													No.
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Full Name
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Status
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Created At
												</th>
												<th className="pb-3 text-right font-medium text-sm">
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{freeMembers.map((member, index) => (
												<tr
													key={member.id || `free-${index}`}
													className="border-b last:border-0"
												>
													<td className="py-3 text-sm">{index + 1}</td>
													<td className="py-3 font-medium text-sm">
														{member.full_name}
													</td>
													<td className="py-3">
														<Badge
															variant="outline"
															className="rounded-none border-green-500 text-green-600 text-xs"
														>
															Free
														</Badge>
													</td>
													<td className="py-3 text-muted-foreground text-sm">
														{formatDate(member.created_at)}
													</td>
													<td className="py-3 text-right">
														<Button
															onClick={() => {
																const actualIndex = teamMembers.findIndex(
																	(m) => m.id === member.id,
																);
																handleRemoveMember(
																	actualIndex,
																	member.full_name,
																);
															}}
															size="sm"
															variant="ghost"
															className="text-destructive hover:bg-destructive/10 hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* Charged Members Table */}
					{chargedMembers.length > 0 && (
						<div className="border">
							<div className="border-b p-4">
								<div className="flex items-center justify-between">
									<h3 className="flex items-center gap-2 font-semibold text-lg">
										<Users className="h-5 w-5 text-amber-600" />
										<span className="text-amber-600">
											Charged Members ({chargedMembers.length})
										</span>
									</h3>
									<span className="font-bold text-lg">
										RM {totalCharges.toFixed(2)}
									</span>
								</div>
							</div>
							<div className="p-4">
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="pb-3 text-left font-medium text-sm">
													No.
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Full Name
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Fee
												</th>
												<th className="pb-3 text-left font-medium text-sm">
													Created At
												</th>
												<th className="pb-3 text-right font-medium text-sm">
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{chargedMembers.map((member, index) => (
												<tr
													key={member.id || `charged-${index}`}
													className="border-b last:border-0"
												>
													<td className="py-3 text-sm">
														{limit ? limit + index + 1 : index + 1}
													</td>
													<td className="py-3 font-medium text-sm">
														{member.full_name}
													</td>
													<td className="py-3">
														<Badge
															variant="outline"
															className="rounded-none border-amber-500 text-amber-600 text-xs"
														>
															+RM {fee.toFixed(2)}
														</Badge>
													</td>
													<td className="py-3 text-muted-foreground text-sm">
														{formatDate(member.created_at)}
													</td>
													<td className="py-3 text-right">
														<Button
															onClick={() => {
																const actualIndex = teamMembers.findIndex(
																	(m) => m.id === member.id,
																);
																handleRemoveMember(
																	actualIndex,
																	member.full_name,
																);
															}}
															size="sm"
															variant="ghost"
															className="text-destructive hover:bg-destructive/10 hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
				</>
			)}

			{/* Add Member Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add Team Member</DialogTitle>
						<DialogDescription>
							{limit && freeSlots !== null && freeSlots > 0 ? (
								<span>
									You have {freeSlots} free slot{freeSlots !== 1 ? "s" : ""}{" "}
									remaining.
								</span>
							) : limit && fee > 0 ? (
								<span className="text-amber-600">
									This member will be charged RM {fee.toFixed(2)}.
								</span>
							) : null}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="member-name">Full Name</Label>
							<Input
								id="member-name"
								value={newMemberName}
								onChange={(e) => setNewMemberName(e.target.value)}
								placeholder="Enter full name"
								className="rounded-none"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleConfirmAdd();
									}
								}}
							/>
						</div>
						{limit && currentCount >= limit && fee > 0 && (
							<Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-600 text-sm">
									Adding this member will incur an additional charge of RM{" "}
									{fee.toFixed(2)}.
								</AlertDescription>
							</Alert>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddDialogOpen(false)}
							className="rounded-none"
						>
							Cancel
						</Button>
						<Button onClick={handleConfirmAdd} className="rounded-none">
							Add Member
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
