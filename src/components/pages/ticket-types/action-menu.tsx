"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { deleteTicketType, type TicketType } from "@/lib/api/ticket-type";
import { EditTicketTypeForm } from "./edit-ticket-type-form";

interface TicketTypeActionsMenuProps {
	ticketType: TicketType;
}

export function TicketTypeActionsMenu({
	ticketType,
}: TicketTypeActionsMenuProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: deleteTicketType,
		onSuccess: () => {
			toast.success("Ticket type deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete ticket type");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditTicketTypeForm,
			props: {
				ticketType,
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Ticket Type",
				description: "Update ticket type information",
				size: "2xl",
				className: "rounded-none",
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Ticket Type",
			message: `Are you sure you want to delete "${ticketType.name}"? This action cannot be undone.`,
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			size: "sm",
			onConfirm: () => {
				deleteMutation.mutate({
					eventId,
					ticketTypeId: ticketType.id.toString(),
				});
			},
			onCancel: closeDialog,
		});
	};

	return (
		<TooltipProvider delayDuration={0}>
			<ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={handleEditClick}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Edit</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none text-red-600 hover:text-red-600"
							onClick={handleDeleteClick}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Delete</TooltipContent>
				</Tooltip>
			</ButtonGroup>
		</TooltipProvider>
	);
}
