"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Cog,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { deleteGroup } from "@/lib/api/group";
import type { Group } from "@/lib/api/group/response";
import { ConfirmDialog } from "../dialogs/confirm-dialog";
import { EditGroupDialog } from "../dialogs/edit-group-dialog";

interface GroupActionsMenuProps {
	group: Group;
}

export function GroupActionsMenu({ group }: GroupActionsMenuProps) {
	const router = useRouter();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// Only org_owner can delete groups
	const canDeleteGroup = user?.role === "org_owner";

	const deleteGroupMutation = useMutation({
		mutationFn: deleteGroup,
		onSuccess: () => {
			toast.success("Group deleted successfully!");
			queryClient.invalidateQueries({ queryKey: ["groups"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete group");
		},
	});

	const handleManageClick = () => {
		router.push(`/groups/${group.id}`);
	};

	const handleEditClick = () => {
		openDialog({
			component: EditGroupDialog,
			props: {
				group,
				open: true,
				onOpenChange: (open: boolean) => {
					if (!open) closeDialog();
				},
			},
			config: {
				title: "Edit Group",
				description: "Update group information",
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to delete "${group.name}"? This action cannot be undone and will remove all members from this group.`,
				confirmLabel: "Delete",
				variant: "destructive",
				icon: "alert",
				onConfirm: () => {
					deleteGroupMutation.mutate(group.id);
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Delete Group",
				size: "sm",
			},
		});
	};

	return (
		<ButtonGroup>
			<Button
				variant="outline"
				className="rounded-none"
				onClick={handleManageClick}
			>
				<Cog className="h-4 w-4" />
				Manage
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="rounded-none px-2" variant="outline">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="center" side="left" className="rounded-none">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit Group
					</DropdownMenuItem>
					{canDeleteGroup && (
						<DropdownMenuItem
							className="rounded-none text-destructive"
							onClick={handleDeleteClick}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Group
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</ButtonGroup>
	);
}
