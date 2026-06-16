"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, MoreHorizontal, Pencil, Send, UserCheck, X } from "lucide-react";
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
import { useDialog } from "@/hooks/use-dialog";
import {
	approveTicketApplication,
	approveTicketRsvp,
	resendTicketRsvp,
} from "@/lib/api/event/pending";
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
	const { openDialog } = useDialog();
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

	return {
		approveMutation,
		resendMutation,
		approveRsvpMutation,
		openEditModal,
		openViewModal,
		openRejectModal,
	};
}

export function PendingTicketActionsMenu({
	ticket,
}: PendingTicketActionsMenuProps) {
	const {
		approveMutation,
		resendMutation,
		approveRsvpMutation,
		openEditModal,
		openViewModal,
		openRejectModal,
	} = usePendingTicketActions({ ticket });

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
		</ButtonGroup>
	);
}
