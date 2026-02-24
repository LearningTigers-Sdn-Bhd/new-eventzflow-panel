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
import {
	deleteRegistrationForm,
	type RegistrationForm,
} from "@/lib/api/registration-form";
import { EditRegistrationFormForm } from "./edit-registration-form-form";

interface RegistrationFormActionsMenuProps {
	registrationForm: RegistrationForm;
}

export function RegistrationFormActionsMenu({
	registrationForm,
}: RegistrationFormActionsMenuProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: deleteRegistrationForm,
		onSuccess: () => {
			toast.success("Registration form deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "registration-forms"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete registration form");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditRegistrationFormForm,
			props: {
				registrationForm,
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Registration Form",
				description: "Update registration form details and ticket mapping",
				size: "full",
				className: "rounded-none",
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Registration Form",
			message: `Are you sure you want to delete "${registrationForm.name}"? This action cannot be undone.`,
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			size: "sm",
			onConfirm: () => {
				deleteMutation.mutate({
					eventId,
					registrationFormId: registrationForm.id.toString(),
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
