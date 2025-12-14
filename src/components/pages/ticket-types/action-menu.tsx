"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { deleteTicketType, type TicketType } from "@/lib/api/ticket-type";
import { ConfirmDialog } from "./confirm-dialog";
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
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to delete "${ticketType.name}"? This action cannot be undone.`,
				confirmLabel: "Delete",
				cancelLabel: "Cancel",
				variant: "destructive",
				onConfirm: () => {
					deleteMutation.mutate({
						eventId,
						ticketTypeId: ticketType.id.toString(),
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Delete Ticket Type",
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
			<DropdownMenuContent align="center" side="left" className="rounded-none">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
