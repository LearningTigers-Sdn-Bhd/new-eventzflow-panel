"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserCog } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { removeStaff } from "@/lib/api/event/event-staff";
import EditRoleForm from "./edit-role-form";
import type { EventStaffMember } from "./event-staff-table-columns";

interface EventStaffActionsMenuProps {
	member: EventStaffMember;
}

export function EventStaffActionsMenu({ member }: EventStaffActionsMenuProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();

	const queryClient = useQueryClient();
	const removeStaffMutation = useMutation({
		mutationFn: removeStaff,
		onSuccess: () => {
			toast.success("Staff member removed from event successfully!");
			// Invalidate and refetch event staff query
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "staff"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove staff member");
		},
	});

	const handleEditRoleClick = () => {
		openDialog({
			component: EditRoleForm,
			props: {
				member,
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Change Event Role",
				description: "Update the staff member's role for this event",
				size: "sm",
			},
		});
	};

	const handleRemoveClick = () => {
		openConfirm({
			title: "Remove Staff Member",
			message: `Are you sure you want to remove ${member.full_name} from this event? They will no longer have access to this event's staff functions.`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				removeStaffMutation.mutate({
					eventId,
					userId: member.id,
				});
			},
			onCancel: closeDialog,
		});
	};

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={handleEditRoleClick}
				title="Change Role"
			>
				<UserCog className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
				onClick={handleRemoveClick}
				title="Remove from Event"
			>
				<Trash2 className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
