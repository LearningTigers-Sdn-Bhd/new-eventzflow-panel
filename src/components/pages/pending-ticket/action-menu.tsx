"use client";

import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import PendingTicketEditModal from "./action-modals/edit-ticket-form";
import PendingTicketViewModal from "./action-modals/view-modal";
import type { PendingTicket } from "./columns";

interface PendingTicketActionsMenuProps {
	ticket: PendingTicket;
}

export function PendingTicketActionsMenu({
	ticket,
}: PendingTicketActionsMenuProps) {
	const { openDialog } = useDialog();

	const openEditModal = () => {
		openDialog({
			component: PendingTicketEditModal,
			config: {
				title: "Edit Pending Ticket",
				description: "Edit the pending ticket information.",
				size: "full",
				showCloseButton: true,
			},
			props: { ticket },
		});
	};

	const openViewModal = () => {
		openDialog({
			component: PendingTicketViewModal,
			config: {
				title: "View Pending Ticket",
				size: "2xl",
				showCloseButton: true,
			},
			props: { ticket },
		});
	};

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={openEditModal}
				title="Edit Ticket"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={openViewModal}
				title="View Ticket"
			>
				<Eye className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
