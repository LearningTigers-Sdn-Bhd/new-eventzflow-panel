"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Plus,
	Trash2,
	Users,
	AlertCircle,
	Info,
	DollarSign,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	FieldDescription,
	FieldGroup,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { ExhibitorTeamMember } from "@/lib/api/exhibitor-kit/response";
import type { EventVendor } from "@/lib/api/event-vendor";
import { getExhibitorTeamMemberLimit } from "@/lib/api/exhibitor-team-member-limit";

interface ManageTeamMembersFormProps {
	vendor: EventVendor;
	onClose?: () => void;
}

interface TeamMemberInput {
	id?: number;
	full_name: string;
	_destroy?: boolean;
}

export function ManageTeamMembersForm({
	vendor,
	onClose,
}: ManageTeamMembersFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kit;

	const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>(
		kit?.exhibitor_team_members?.map((m: ExhibitorTeamMember) => ({
			id: m.id,
			full_name: m.full_name,
		})) || [],
	);
	const [newMemberName, setNewMemberName] = useState("");

	const queryClient = useQueryClient();

	// Fetch team member limit settings
	const { data: limitSettings } = useQuery({
		queryKey: ["exhibitor-team-member-limit", eventId],
		queryFn: () => getExhibitorTeamMemberLimit(eventId),
		retry: false,
	});

	const updateKitMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) =>
			updateExhibitorKit(eventId, kit!.id, data),
		onSuccess: () => {
			toast.success("Team members updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update team members");
		},
	});

	const handleAddMember = () => {
		if (!newMemberName.trim()) {
			toast.error("Please enter a name");
			return;
		}
		setTeamMembers([...teamMembers, { full_name: newMemberName.trim() }]);
		setNewMemberName("");
	};

	const handleRemoveMember = (index: number) => {
		const member = teamMembers[index];
		if (member.id) {
			setTeamMembers(
				teamMembers.map((m, i) => (i === index ? { ...m, _destroy: true } : m)),
			);
		} else {
			setTeamMembers(teamMembers.filter((_, i) => i !== index));
		}
	};

	const handleUpdateMemberName = (index: number, name: string) => {
		setTeamMembers(
			teamMembers.map((m, i) => (i === index ? { ...m, full_name: name } : m)),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!kit) {
			toast.error("No exhibitor kit found");
			return;
		}

		const validMembers = teamMembers.filter(
			(m) => m.full_name.trim() || m._destroy,
		);

		await updateKitMutation.mutateAsync({
			exhibitor_team_members_attributes: validMembers.map((m) => ({
				id: m.id,
				full_name: m.full_name.trim(),
				_destroy: m._destroy,
			})),
		});
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	const visibleMembers = teamMembers.filter((m) => !m._destroy);
	const currentCount = visibleMembers.length;

	// Calculate limit status
	const hasLimit = limitSettings && limitSettings.team_member_limit;
	const limit = limitSettings?.team_member_limit || null;
	const fee = limitSettings?.extra_team_member_fee
		? Number.parseFloat(limitSettings.extra_team_member_fee)
		: 0;

	const freeSlots = hasLimit ? Math.max((limit || 0) - currentCount, 0) : null;
	const excessCount = hasLimit
		? Math.max(currentCount - (limit || 0), 0)
		: 0;
	const extraCharges = excessCount * fee;
	const isOverLimit = hasLimit && currentCount > (limit || 0);
	const isAtLimit = hasLimit && currentCount === limit;
	const canAddMore = !hasLimit || currentCount < (limit || 0) || fee > 0;

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
											<p className="font-medium text-sm">Current: {currentCount}</p>
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
													{excessCount} excess member{excessCount !== 1 ? "s" : ""}
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
							<div className="flex gap-2">
								<Input
									value={newMemberName}
									onChange={(e) => setNewMemberName(e.target.value)}
									placeholder="Enter team member name"
									disabled={updateKitMutation.isPending || !canAddMore}
									className="flex-1 rounded-none"
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
							<p className="flex items-center gap-2 font-medium text-sm">
								<Users className="size-4" />
								Team Members ({visibleMembers.length})
							</p>

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
											{teamMembers.map((member, index) => {
												if (member._destroy) return null;
												const isFree = index < (limit || 0);
												if (!isFree) return null;
												return (
													<div
														key={member.id || `new-${index}`}
														className="flex items-center gap-2 rounded-none border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20"
													>
														<span className="shrink-0 font-medium text-green-600 text-xs dark:text-green-400">
															#{index + 1}
														</span>
														<Input
															value={member.full_name}
															onChange={(e) =>
																handleUpdateMemberName(index, e.target.value)
															}
															disabled={updateKitMutation.isPending}
															className="min-w-0 flex-1 rounded-none"
														/>
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															onClick={() => handleRemoveMember(index)}
															disabled={updateKitMutation.isPending}
															className="shrink-0 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
														>
															<Trash2 className="size-4" />
														</Button>
													</div>
												);
											})}
										</div>
									</div>

									{/* Paid Team Members Section */}
									{excessCount > 0 && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
													Additional Team Members (Paid)
												</p>
												<span className="font-medium text-amber-600 text-xs dark:text-amber-400">
													{excessCount} × RM {fee.toFixed(2)} = RM{" "}
													{extraCharges.toFixed(2)}
												</span>
											</div>
											<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
												{teamMembers.map((member, index) => {
													if (member._destroy) return null;
													const isPaid = index >= (limit || 0);
													if (!isPaid) return null;
													return (
														<div
															key={member.id || `new-${index}`}
															className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20"
														>
															<span className="shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400">
																#{index + 1}
															</span>
															<Input
																value={member.full_name}
																onChange={(e) =>
																	handleUpdateMemberName(index, e.target.value)
																}
																disabled={updateKitMutation.isPending}
																className="min-w-0 flex-1 rounded-none"
															/>
															<span className="shrink-0 whitespace-nowrap font-medium text-amber-600 text-xs dark:text-amber-400">
																+{fee.toFixed(0)}
															</span>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																onClick={() => handleRemoveMember(index)}
																disabled={updateKitMutation.isPending}
																className="shrink-0 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
															>
																<Trash2 className="size-4" />
															</Button>
														</div>
													);
												})}
											</div>
										</div>
									)}
								</div>
							) : (
								// Show simple grid when no limit
								<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
									{teamMembers.map((member, index) => {
										if (member._destroy) return null;
										return (
											<div
												key={member.id || `new-${index}`}
												className="flex items-center gap-2 rounded-none border bg-muted/30 p-2"
											>
												<span className="shrink-0 font-medium text-muted-foreground text-xs">
													#{index + 1}
												</span>
												<Input
													value={member.full_name}
													onChange={(e) =>
														handleUpdateMemberName(index, e.target.value)
													}
													disabled={updateKitMutation.isPending}
													className="min-w-0 flex-1 rounded-none"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													onClick={() => handleRemoveMember(index)}
													disabled={updateKitMutation.isPending}
													className="shrink-0 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										);
									})}
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
