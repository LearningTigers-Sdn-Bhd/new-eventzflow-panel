"use client";

import { Plus, Shield, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
	useRemoveGroupMember,
	useUpdateGroupMember,
} from "@/hooks/use-group-members";
import type { GroupMember } from "@/lib/api/group";
import { AddMemberDialog } from "../dialogs/add-member-dialog";

interface GroupMembersTableProps {
	groupId: number;
	members: GroupMember[];
}

export function GroupMembersTable({
	groupId,
	members,
}: GroupMembersTableProps) {
	const { user } = useAuth();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const updateMember = useUpdateGroupMember();
	const removeMember = useRemoveGroupMember();

	// Check if current user is org_owner or a group manager
	const canManageMembers = useMemo(() => {
		if (!user) return false;
		if (user.role === "org_owner") return true;

		// Check if user is a manager of this group
		const userMembership = members.find((m) => m.user_id === user.id);
		return userMembership?.has_manager_access ?? false;
	}, [user, members]);

	const handleToggleManager = async (member: GroupMember) => {
		try {
			await updateMember.mutateAsync({
				groupId,
				memberId: member.id,
				data: { has_manager_access: !member.has_manager_access },
			});
			toast.success("Member access updated");
		} catch (error) {
			toast.error("Failed to update member access");
		}
	};

	const handleRemove = async (member: GroupMember) => {
		try {
			await removeMember.mutateAsync({ groupId, memberId: member.id });
			toast.success("Member removed from group");
		} catch (error) {
			toast.error("Failed to remove member");
		}
	};

	return (
		<>
			<Card className="rounded-none border-dashed">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Members</CardTitle>
							<CardDescription>
								Manage group members and their access
							</CardDescription>
						</div>
						{canManageMembers && (
							<Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Member
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{members.length === 0 ? (
						<div className="flex h-[200px] items-center justify-center text-center">
							<div>
								<User className="mx-auto h-12 w-12 text-muted-foreground" />
								<p className="mt-2 text-muted-foreground text-sm">
									No members yet. Add your first member.
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{members.map((member) => (
								<div
									key={member.id}
									className="flex items-center justify-between rounded-none border border-dashed bg-muted/20 p-4 transition-colors hover:bg-muted/30"
								>
									<div className="flex min-w-0 flex-1 items-center gap-4">
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-dashed bg-background">
											<User className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">
												{member.user.full_name}
											</p>
											<p className="truncate text-muted-foreground text-xs">
												{member.user.email}
											</p>
										</div>
										{member.has_manager_access && (
											<Badge
												variant="secondary"
												className="flex-shrink-0 rounded-none"
											>
												<Shield className="mr-1 h-3 w-3" />
												Manager
											</Badge>
										)}
									</div>
									{canManageMembers && (
										<div className="ml-4 flex flex-shrink-0 gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleToggleManager(member)}
												className="rounded-none"
											>
												{member.has_manager_access ? "Remove" : "Make Manager"}
											</Button>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleRemove(member)}
												className="rounded-none"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AddMemberDialog
				groupId={groupId}
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
			/>
		</>
	);
}
