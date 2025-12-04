"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
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

	return (
		<section className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldDescription>
						Add or remove team members for {vendor.vendor.full_name}.
					</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						<div className="flex gap-2">
							<Input
								value={newMemberName}
								onChange={(e) => setNewMemberName(e.target.value)}
								placeholder="Enter team member name"
								disabled={updateKitMutation.isPending}
								className="rounded-none flex-1"
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
								disabled={updateKitMutation.isPending}
								className="rounded-none"
							>
								<Plus className="size-4 mr-2" />
								Add
							</Button>
						</div>

						<FieldSeparator />

						<div className="space-y-2">
							<p className="text-sm font-medium flex items-center gap-2">
								<Users className="size-4" />
								Team Members ({visibleMembers.length})
							</p>

							{visibleMembers.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground border border-dashed rounded-none">
									No team members added yet.
								</div>
							) : (
								<div className="space-y-2">
									{teamMembers.map((member, index) => {
										if (member._destroy) return null;
										return (
											<div
												key={member.id || `new-${index}`}
												className="flex items-center gap-2 p-2 border rounded-none bg-muted/30"
											>
												<Input
													value={member.full_name}
													onChange={(e) =>
														handleUpdateMemberName(index, e.target.value)
													}
													disabled={updateKitMutation.isPending}
													className="rounded-none flex-1"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													onClick={() => handleRemoveMember(index)}
													disabled={updateKitMutation.isPending}
													className="rounded-none text-red-500 hover:text-red-600 hover:bg-red-50"
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
