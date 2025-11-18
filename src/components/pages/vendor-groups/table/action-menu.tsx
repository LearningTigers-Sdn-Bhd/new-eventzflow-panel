"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Eye,
	Pencil,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
				size="icon-sm"
				variant="outline"
				className="rounded-none text-purple-500 hover:bg-purple-50 hover:text-purple-600 [&_svg]:text-purple-500 hover:[&_svg]:text-purple-600"
				onClick={handleManageClick}
				title="View Group"
			>
				<Eye className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={handleEditClick}
				title="Edit Group"
			>
				<Pencil className="size-4" />
			</Button>
			{canDeleteGroup && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
					onClick={handleDeleteClick}
					title="Delete Group"
				>
					<Trash2 className="size-4" />
				</Button>
			)}
		</ButtonGroup>
	);
}
