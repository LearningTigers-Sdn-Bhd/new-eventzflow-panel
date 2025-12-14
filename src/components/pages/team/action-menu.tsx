"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle,
	MoreHorizontal,
	Pencil,
	PowerOff,
	Trash2,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { deleteMember, toggleMemberStatus } from "@/lib/api/team";
import type { TeamMember } from "./columns";
import ConfirmDialog from "./confirm-dialog";
import EditMemberForm from "./edit-member-form";

interface TeamMemberActionsMenuProps {
	member: TeamMember;
}

export function TeamMemberActionsMenu({ member }: TeamMemberActionsMenuProps) {
	const router = useRouter();
	const { openDialog, closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: toggleMemberStatus,
		onSuccess: (_, variables) => {
			const action =
				variables.status === "inactive" ? "deactivated" : "activated";
			toast.success(`Team member ${action} successfully!`);
			// Invalidate and refetch team members queries
			queryClient.invalidateQueries({ queryKey: ["team", "members"] });
			queryClient.invalidateQueries({ queryKey: ["organizer-members"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update team member status");
		},
	});

	const deleteMemberMutation = useMutation({
		mutationFn: deleteMember,
		onSuccess: () => {
			toast.success("Team member deleted successfully!");
			// Invalidate and refetch team members queries
			queryClient.invalidateQueries({ queryKey: ["team", "members"] });
			queryClient.invalidateQueries({ queryKey: ["organizer-members"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete team member");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditMemberForm,
			props: {
				member,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Team Member",
				description: "Update team member information and credentials",
				size: "2xl",
			},
		});
	};

	const handleToggleStatusClick = () => {
		const isActive = member.status === "active";
		const newStatus = isActive ? "inactive" : "active";
		const action = isActive ? "deactivate" : "activate";

		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to ${action} ${member.full_name}? ${
					isActive
						? "They will no longer be able to access the system."
						: "They will be able to access the system again."
				}`,
				confirmLabel: isActive ? "Deactivate" : "Activate",
				variant: isActive ? "warning" : "success",
				icon: isActive ? "alert" : "check",
				onConfirm: () => {
					toggleStatusMutation.mutate({
						id: member.id,
						status: newStatus,
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: `${isActive ? "Deactivate" : "Activate"} Team Member`,
				size: "sm",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to delete ${member.full_name}? This action cannot be undone and all associated data will be permanently removed.`,
				confirmLabel: "Delete",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					deleteMemberMutation.mutate({
						id: member.id,
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Delete Team Member",
				size: "sm",
			},
		});
	};

	const handleViewMembersClick = () => {
		router.push(`/team/${member.id}`);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" side="left" className="rounded-none">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				{member.role === "organizer" && (
					<>
						<DropdownMenuItem
							className="rounded-none"
							onClick={handleViewMembersClick}
						>
							<Users className="mr-2 h-4 w-4" />
							View Members
						</DropdownMenuItem>
						<DropdownMenuSeparator className="rounded-none" />
					</>
				)}
				<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit Member
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={handleToggleStatusClick}
				>
					{member.status === "active" ? (
						<>
							<PowerOff className="mr-2 h-4 w-4" />
							Deactivate Member
						</>
					) : (
						<>
							<CheckCircle className="mr-2 h-4 w-4" />
							Activate Member
						</>
					)}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Member
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
