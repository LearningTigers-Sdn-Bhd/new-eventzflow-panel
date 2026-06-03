"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Archive,
	Eye,
	MoreHorizontal,
	Pencil,
	QrCode,
	RotateCcw,
	Send,
	Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
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
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
	archiveTicket,
	forceDeleteTicket,
	resendTicketConfirmationEmail,
	restoreTicket,
} from "@/lib/api/ticket";
import { cn } from "@/lib/utils";
import TicketEditModal from "./action-modals/edit-event-ticket-form";
import TicketViewModal from "./action-modals/event-ticket-view-modal";
import TicketQRModal from "./action-modals/qr-modal";
import UnscanModal from "./action-modals/unscan-modal";
import type { BaseTicket } from "./event-ticket-table-columns";

interface TicketActionsMenuProps {
	ticket: BaseTicket;
	deletedAt?: string | null;
}

interface UseTicketActionsProps {
	ticket: BaseTicket;
	eventId?: string;
}

export function useTicketActions({
	ticket,
	eventId: eventIdProp,
}: UseTicketActionsProps) {
	const params = useParams();
	const eventId = eventIdProp || (params.event_id as string);
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const queryClient = useQueryClient();

	const openEditModal = () => {
		openDialog({
			component: TicketEditModal,
			config: {
				title: "Edit Ticket",
				description: "Edit the ticket information.",
				size: "full",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const openViewModal = () => {
		openDialog({
			component: TicketViewModal,
			config: {
				title: "View Ticket",
				description: "View the ticket information.",
				size: "2xl",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const openQRModal = () => {
		openDialog({
			component: TicketQRModal,
			config: {
				title: "Generate QR Code",
				size: "4xl",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const openUnscanModal = () => {
		openDialog({
			component: UnscanModal,
			config: {
				title: "Unscan Ticket",
				description: "Reset this ticket to not scanned status.",
				size: "lg",
				showCloseButton: true,
			},
			props: { ticket },
		});
	};

	const archiveTicketMutation = useMutation({
		mutationFn: () => archiveTicket(eventId, ticket.publicId),
		onSuccess: () => {
			toast.success("Ticket archived successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to archive ticket");
		},
	});

	const deleteTicketMutation = useMutation({
		mutationFn: () => forceDeleteTicket(eventId, ticket.publicId),
		onSuccess: () => {
			toast.success("Ticket deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete ticket");
		},
	});

	const restoreTicketMutation = useMutation({
		mutationFn: () => restoreTicket(eventId, ticket.publicId),
		onSuccess: () => {
			toast.success("Ticket restored successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to restore ticket");
		},
	});

	const resendConfirmationEmailMutation = useMutation({
		mutationFn: () => resendTicketConfirmationEmail(eventId, ticket.publicId),
		onSuccess: () => {
			toast.success("Ticket confirmation email has been queued for resend.");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
		},
		onError: (error: Error) => {
			toast.error(
				error.message || "Failed to resend ticket confirmation email",
			);
		},
	});

	const handleArchiveClick = () => {
		openConfirm({
			title: "Archive Ticket",
			message:
				"Are you sure you want to archive this ticket? The ticket will be archived and hidden from the main list.",
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				archiveTicketMutation.mutate();
			},
			onCancel: closeDialog,
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Ticket",
			message:
				"Are you sure you want to permanently delete this ticket? This action cannot be undone and all associated data will be permanently removed.",
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteTicketMutation.mutate();
			},
			onCancel: closeDialog,
		});
	};

	const handleRestoreClick = () => {
		openConfirm({
			title: "Restore Ticket",
			message:
				"Are you sure you want to restore this ticket? The ticket will be unarchived and visible in the main list again.",
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			icon: "check",
			size: "sm",
			onConfirm: () => {
				restoreTicketMutation.mutate();
			},
			onCancel: closeDialog,
		});
	};

	const handleResendConfirmationEmailClick = () => {
		openConfirm({
			title: "Resend Ticket Confirmation Email",
			message:
				"Resend the ticket confirmation email with QR code to this attendee?",
			confirmLabel: "Resend Email",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				resendConfirmationEmailMutation.mutate();
			},
			onCancel: closeDialog,
		});
	};

	return {
		openEditModal,
		openViewModal,
		openQRModal,
		openUnscanModal,
		handleArchiveClick,
		handleDeleteClick,
		handleRestoreClick,
		handleResendConfirmationEmailClick,
	};
}

export function TicketActionsMenu({
	ticket,
	deletedAt,
}: TicketActionsMenuProps) {
	const { user } = useAuth();
	const isArchived = !!deletedAt;

	const {
		openEditModal,
		openViewModal,
		openQRModal,
		openUnscanModal,
		handleArchiveClick,
		handleDeleteClick,
		handleRestoreClick,
		handleResendConfirmationEmailClick,
	} = useTicketActions({ ticket });

	// Check if unscan button should be shown
	// For org_owner or organizer and when ticket status is "scanned"
	const showUnscanButton =
		(user?.role === "org_owner" || user?.role === "organizer") &&
		ticket.status === "scanned";

	// Determine which actions to show based on role and archive status
	const showArchive =
		!isArchived && ["org_owner", "organizer"].includes(user?.role || "");
	const showDelete = user?.role === "org_owner";
	const showResendConfirmationEmail =
		user?.role === "org_owner" || user?.role === "organizer";
	const showRestore =
		isArchived && ["org_owner", "organizer"].includes(user?.role || "");
	const showMoreMenu =
		showArchive || showDelete || showRestore || showResendConfirmationEmail;

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="h-8 w-8 rounded-none p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={openEditModal}
				title="Edit Ticket"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="h-8 w-8 rounded-none p-0 text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={openViewModal}
				title="View Ticket"
			>
				<Eye className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="h-8 w-8 rounded-none p-0 text-purple-500 hover:bg-purple-50 hover:text-purple-600 [&_svg]:text-purple-500 hover:[&_svg]:text-purple-600"
				onClick={openQRModal}
				title="Generate QR Code"
			>
				<QrCode className="size-4" />
			</Button>
			{showUnscanButton && (
				<Button
					size="icon-sm"
					variant="outline"
					className="h-8 w-8 rounded-none p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 [&_svg]:text-amber-600 hover:[&_svg]:text-amber-700"
					onClick={openUnscanModal}
					title="Unscan Ticket"
				>
					<RotateCcw className="size-4" />
				</Button>
			)}
			{showMoreMenu && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon-sm"
							variant="outline"
							className="h-8 w-8 rounded-none p-0"
							title="More Actions"
						>
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="center"
						side="left"
						className="rounded-none"
					>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{showArchive && (
							<DropdownMenuItem
								className="rounded-none"
								onClick={handleArchiveClick}
							>
								<Archive className="mr-2 h-4 w-4" />
								Archive Ticket
							</DropdownMenuItem>
						)}
						{showRestore && (
							<DropdownMenuItem
								className="rounded-none"
								onClick={handleRestoreClick}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Restore Ticket
							</DropdownMenuItem>
						)}
						{showResendConfirmationEmail && (
							<DropdownMenuItem
								className="rounded-none"
								onClick={handleResendConfirmationEmailClick}
							>
								<Send className="mr-2 h-4 w-4" />
								Resend Ticket Email
							</DropdownMenuItem>
						)}
						{showDelete && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className={cn("rounded-none text-red-600")}
									onClick={handleDeleteClick}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Ticket
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</ButtonGroup>
	);
}
