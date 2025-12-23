"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Info, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { DataTable } from "./team-members/data-table";
import {
	type TeamMemberRow,
	type TeamMembersTableMeta,
	teamMembersColumns,
} from "./team-members/team-members-columns";
import { TeamMemberPaymentSection } from "./team-member-payment-section";

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

	const handleRemoveMember = (member: TeamMemberRow) => {
		openConfirm({
			title: "Remove Team Member",
			description: "This action cannot be undone.",
			message: `Are you sure you want to remove "${member.full_name}" from your team?`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			variant: "destructive",
			icon: "delete",
			onConfirm: () => {
				const actualIndex = teamMembers.findIndex((m) => m.id === member.id);
				const memberData = teamMembers[actualIndex];
				if (memberData?.id) {
					// Mark existing member for deletion and save immediately
					const updatedMembers = teamMembers.map((m, i) =>
						i === actualIndex ? { ...m, _destroy: true } : m,
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
					setTeamMembers(teamMembers.filter((_, i) => i !== actualIndex));
					toast.success("Team member removed");
				}
				closeDialog();
			},
			onCancel: closeDialog,
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

	// Use backend values for unpaid excess (accounts for already verified payments)
	const unpaidExcessCount = kit?.unpaid_excess_team_member_count ?? 0;
	const unpaidCharges = kit?.extra_team_member_charges
		? Number(kit.extra_team_member_charges)
		: 0;

	// Total excess for display purposes (regardless of payment status)
	const totalExcessCount = limit && currentCount > limit ? currentCount - limit : 0;
	const totalCharges = totalExcessCount * fee;

	const canAddMore = !limit || fee > 0 || currentCount < limit;

	// Transform active members to table rows
	const tableData: TeamMemberRow[] = useMemo(() => {
		return activeMembers.map((member, index) => ({
			id: member.id,
			full_name: member.full_name,
			created_at: member.created_at,
			_destroy: member._destroy,
			isFree: limit ? index < limit : true,
			fee: fee,
			index: index,
		}));
	}, [activeMembers, limit, fee]);

	const tableMeta: TeamMembersTableMeta = {
		onRemoveMember: handleRemoveMember,
	};

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
							{Math.min(currentCount, limit)} / {limit} used
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
								{totalExcessCount} × RM {fee.toFixed(2)}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Warning for exceeded limit */}
			{limit && currentCount > limit && fee > 0 && (
				<Alert className="rounded-none border-amber-500 bg-amber-50 dark:bg-amber-950/20">
					<AlertCircle className="h-4 w-4 text-amber-600" />
					<AlertDescription className="text-amber-600">
						You have {totalExcessCount} team member{totalExcessCount !== 1 ? "s" : ""}{" "}
						exceeding the free limit. Additional charges of RM{" "}
						{totalCharges.toFixed(2)} will apply.
					</AlertDescription>
				</Alert>
			)}

			{/* Extra Team Member Payment Section - Uses unpaid excess from backend */}
			<TeamMemberPaymentSection
				eventId={eventId.toString()}
				kitId={kit.id.toString()}
				excessCount={unpaidExcessCount}
				feePerMember={fee}
				totalCharges={unpaidCharges}
			/>

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

			{/* Team Members Table */}
			<DataTable
				columns={teamMembersColumns}
				data={tableData}
				emptyTitle="No Team Members Yet"
				emptyDescription="Add team members who will be attending the event"
				emptyIcon={<Users className="h-12 w-12" />}
				searchPlaceholder="Search team members..."
				searchColumns={["name"]}
				meta={tableMeta}
			/>

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
