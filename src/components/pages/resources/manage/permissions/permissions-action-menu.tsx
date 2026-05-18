"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceMutations } from "@/hooks/resources/use-resource-mutations";
import { useDialog } from "@/hooks/use-dialog";
import type { ResourcePermission } from "@/lib/api/resource/permission";
import { deleteResourcePermission } from "@/lib/api/resource/permission";
import EditPermissionForm from "./action-modals/edit-permission-form";

interface PermissionsActionsMenuProps {
	permission: ResourcePermission;
}

export function PermissionsActionsMenu({
	permission,
}: PermissionsActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();

	const { handleDelete } = useResourceMutations({
		resourceName: "Permission",
		queryKey: ["resource-permissions"],
		deleteFn: deleteResourcePermission,
	});

	const handleEditClick = () => {
		openDialog({
			component: EditPermissionForm,
			props: {
				permission,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Permission",
				description: "Update the permission status for this user",
				size: "sm",
			},
		});
	};

	const handleRemoveClick = () => {
		handleDelete(
			permission.id,
			`Are you sure you want to remove write permission for ${permission.user.fullName}? They will no longer be able to create resources.`,
		);
	};

	return (
		<ButtonGroup>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
						onClick={handleEditClick}
					>
						<Pencil className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Edit Permission</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
						onClick={handleRemoveClick}
					>
						<Trash2 className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Remove Permission</TooltipContent>
			</Tooltip>
		</ButtonGroup>
	);
}
