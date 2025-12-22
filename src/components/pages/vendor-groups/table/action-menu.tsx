"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { deleteGroup } from "@/lib/api/group";
import type { Group } from "@/lib/api/group/response";
import { EditGroupDialog } from "../dialogs/edit-group-dialog";

interface GroupActionsMenuProps {
	group: Group;
}

export function GroupActionsMenu({ group }: GroupActionsMenuProps) {
	const router = useRouter();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
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
		router.push(`/vendor/groups/${group.id}`);
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
		openConfirm({
			title: "Delete Group",
			message: `Are you sure you want to delete "${group.name}"? This action cannot be undone and will remove all members from this group.`,
			confirmLabel: "Delete",
			type: "destructive",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				deleteGroupMutation.mutate(group.id);
			},
			onCancel: closeDialog,
		});
	};

	return (
		<ButtonGroup>
			<Button
				size="sm"
				variant="outline"
				className="rounded-none"
				onClick={handleManageClick}
			>
				<Settings className="mr-2 size-4" />
				Manage
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="icon-sm" variant="outline" className="rounded-none">
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="rounded-none">
					<DropdownMenuItem onClick={handleEditClick} className="rounded-none">
						<Pencil className="mr-2 size-4" />
						Edit
					</DropdownMenuItem>
					{canDeleteGroup && (
						<DropdownMenuItem
							onClick={handleDeleteClick}
							className="rounded-none text-red-600 focus:text-red-600"
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</ButtonGroup>
	);
}
