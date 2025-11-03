"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Trash2, UserCog } from "lucide-react";
import { useParams } from "next/navigation";
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
import { removeStaff } from "@/lib/api/event/event-staff";
import type { EventStaffMember } from "./columns";
import ConfirmDialog from "./confirm-dialog";
import EditRoleForm from "./edit-role-form";

interface EventStaffActionsMenuProps {
	member: EventStaffMember;
}

export function EventStaffActionsMenu({ member }: EventStaffActionsMenuProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

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
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to remove ${member.full_name} from this event? They will no longer have access to this event's staff functions.`,
				confirmLabel: "Remove",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					removeStaffMutation.mutate({
						eventId,
						userId: member.id,
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Remove Staff Member",
				size: "sm",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				side="left"
				className="rounded-none bg-background"
			>
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="rounded-none"
					onClick={handleEditRoleClick}
				>
					<UserCog className="mr-2 h-4 w-4" />
					Change Role
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="rounded-none text-red-600"
					onClick={handleRemoveClick}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Remove from Event
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
