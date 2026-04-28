"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Pencil, Send, X } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import {
	approveTicketApplication,
	resendTicketRsvp,
} from "@/lib/api/event/pending";
import PendingTicketEditModal from "./action-modals/edit-pending-ticket-form";
import PendingTicketViewModal from "./action-modals/pending-ticket-view-modal";
import RejectTicketApplicationModal from "./action-modals/reject-ticket-application-modal";
import type { PendingTicket } from "./pending-ticket-table-columns";

interface PendingTicketActionsMenuProps {
	ticket: PendingTicket;
}

export function PendingTicketActionsMenu({
	ticket,
}: PendingTicketActionsMenuProps) {
	const { openDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
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
				size: "2xl",
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

	const canReview =
		(ticket.ticketApplication?.reviewStatus || "pending_review") ===
		"pending_review";

	const canResend =
		ticket.ticketApplication?.reviewStatus === "approved" &&
		ticket.ticketApplication?.rsvpStatus !== "confirmed";
	const hasTicketApplication = Boolean(ticket.ticketApplication);

	return (
		<ButtonGroup>
			{hasTicketApplication && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
						onClick={() => approveMutation.mutate()}
						title="Approve Application"
						disabled={!canReview || approveMutation.isPending}
					>
						<Check className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
						onClick={openRejectModal}
						title="Reject Application"
						disabled={!canReview}
					>
						<X className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
						onClick={() => resendMutation.mutate()}
						title="Resend RSVP"
						disabled={!canResend || resendMutation.isPending}
					>
						<Send className="size-4" />
					</Button>
				</>
			)}
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
		</ButtonGroup>
	);
}
