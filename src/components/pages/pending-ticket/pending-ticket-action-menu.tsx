"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	Eye,
	MoreHorizontal,
	Pencil,
	Send,
	Trash2,
	UserCheck,
	X,
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
	acceptWaitingList,
	approveTicketApplication,
	approveTicketRsvp,
	resendTicketRsvp,
} from "@/lib/api/event/pending";
import { archiveTicket } from "@/lib/api/ticket";
import PendingTicketEditModal from "./action-modals/edit-pending-ticket-form";
import PendingTicketViewModal from "./action-modals/pending-ticket-view-modal";
import RejectTicketApplicationModal from "./action-modals/reject-ticket-application-modal";
import type { PendingTicket } from "./pending-ticket-table-columns";

interface PendingTicketActionsMenuProps {
	ticket: PendingTicket;
}

interface UsePendingTicketActionsProps {
	ticket: PendingTicket;
	eventId?: string;
}

export function usePendingTicketActions({
	ticket,
	eventId: eventIdProp,
}: UsePendingTicketActionsProps) {
	const params = useParams();
	const eventId = eventIdProp || (params.event_id as string);
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const queryClient = useQueryClient();

	const approveMutation = useMutation({
		mutationFn: () =>
			approveTicketApplication({ eventId, ticketId: ticket.publicId }),
		onSuccess: () => {
			toast.success("Application approved");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to approve application");
		},
	});

	const acceptWaitingListMutation = useMutation({
		mutationFn: () => acceptWaitingList({ eventId, ticketId: ticket.publicId }),
		onSuccess: () => {
			toast.success("Waiting-list ticket accepted");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to accept waiting-list ticket"),
	});

	const resendMutation = useMutation({
		mutationFn: () => resendTicketRsvp({ eventId, ticketId: ticket.publicId }),
		onSuccess: () => {
			toast.success("RSVP invitation resent");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to resend RSVP");
		},
	});

	const approveRsvpMutation = useMutation({
		mutationFn: () => approveTicketRsvp({ eventId, ticketId: ticket.publicId }),
		onSuccess: () => {
			toast.success("RSVP approved on behalf of attendee");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to approve RSVP");
		},
	});

	const openEditModal = () => {
		openDialog({
			component: PendingTicketEditModal,
			config: {
				title: "Edit Pending Ticket",
				description: "Edit the pending ticket information.",
				size: "full",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const openViewModal = () => {
		openDialog({
			component: PendingTicketViewModal,
			config: {
				title: "View Pending Ticket",
				description: "View the pending ticket information.",
				size: "4xl",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const openRejectModal = () => {
		openDialog({
			component: RejectTicketApplicationModal,
			config: {
				title: "Reject Application",
				description: "Optionally include a reason for rejection.",
				size: "md",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { ticket },
		});
	};

	const deleteTicketMutation = useMutation({
		mutationFn: () => archiveTicket(eventId, ticket.publicId),
		onSuccess: () => {
			toast.success("Pending ticket deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete pending ticket");
		},
	});

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Pending Ticket",
			message:
				"Are you sure you want to delete this pending ticket? This action cannot be undone.",
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

	return {
		approveMutation,
		acceptWaitingListMutation,
		resendMutation,
		approveRsvpMutation,
		deleteTicketMutation,
		openEditModal,
		openViewModal,
		openRejectModal,
		handleDeleteClick,
	};
}

export function PendingTicketActionsMenu({
	ticket,
}: PendingTicketActionsMenuProps) {
	const {
		approveMutation,
		acceptWaitingListMutation,
		resendMutation,
		approveRsvpMutation,
		deleteTicketMutation,
		openEditModal,
		openViewModal,
		openRejectModal,
		handleDeleteClick,
	} = usePendingTicketActions({ ticket });

	const { user } = useAuth();
	const canDelete = user?.role === "org_owner" || user?.role === "organizer";

	const canReview =
		(ticket.ticketApplication?.reviewStatus || "pending_review") ===
		"pending_review";

	const canResend =
		ticket.ticketApplication?.reviewStatus === "approved" &&
		ticket.ticketApplication?.rsvpStatus !== "confirmed";
	const canApproveRsvp =
		ticket.ticketApplication?.reviewStatus === "approved" &&
		ticket.ticketApplication?.rsvpStatus === "sent";
	const hasTicketApplication = Boolean(ticket.ticketApplication);

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={openEditModal}
				title="Edit Ticket"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={openViewModal}
				title="View Ticket"
			>
				<Eye className="size-4" />
			</Button>

			{canDelete && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
					onClick={handleDeleteClick}
					disabled={deleteTicketMutation.isPending}
					title="Delete Pending Ticket"
				>
					<Trash2 className="size-4" />
				</Button>
			)}

			{hasTicketApplication && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon-sm" variant="outline" className="rounded-none">
							<span className="sr-only">Open application actions</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="rounded-none">
						<DropdownMenuLabel className="rounded-none">
							Application Actions
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="rounded-none" />
						<DropdownMenuItem
							onClick={() => approveMutation.mutate()}
							disabled={!canReview || approveMutation.isPending}
							className="rounded-none"
						>
							<Check className="mr-2 h-4 w-4 text-emerald-600" />
							Approve Application
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={openRejectModal}
							disabled={!canReview}
							className="rounded-none"
						>
							<X className="mr-2 h-4 w-4 text-red-600" />
							Reject Application
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => resendMutation.mutate()}
							disabled={!canResend || resendMutation.isPending}
							className="rounded-none"
						>
							<Send className="mr-2 h-4 w-4 text-indigo-600" />
							Resend RSVP
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => approveRsvpMutation.mutate()}
							disabled={!canApproveRsvp || approveRsvpMutation.isPending}
							className="rounded-none"
						>
							<UserCheck className="mr-2 h-4 w-4 text-violet-600" />
							Approve RSVP
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			{ticket.waitingList && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-emerald-600 hover:bg-emerald-50"
					onClick={() => acceptWaitingListMutation.mutate()}
					disabled={acceptWaitingListMutation.isPending}
					title="Accept Waiting List"
				>
					<Check className="size-4" />
				</Button>
			)}
		</ButtonGroup>
	);
}
