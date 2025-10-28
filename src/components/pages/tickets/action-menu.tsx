"use client";

import { Eye, Pencil, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import TicketEditModal from "./action-modals/edit-ticket-form";
import TicketQRModal from "./action-modals/qr-modal";
import TicketViewModal from "./action-modals/view-modal";
import type { BaseTicket } from "./columns";

interface TicketActionsMenuProps {
	ticket: BaseTicket;
}

export function TicketActionsMenu({ ticket }: TicketActionsMenuProps) {
	const { openDialog } = useDialog();

	const openEditModal = () => {
		openDialog({
			component: TicketEditModal,
			config: {
				title: "Edit Ticket",
				description: "Edit the ticket information.",
				size: "full",
				showCloseButton: true,
			},
			props: { ticket },
		});
	};

	const openViewModal = () => {
		openDialog({
			component: TicketViewModal,
			config: {
				title: "View Ticket",
				size: "2xl",
				showCloseButton: true,
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
			<Button
				size="icon-sm"
				variant="outline"
				className="text-purple-500 hover:bg-purple-50 hover:text-purple-600 [&_svg]:text-purple-500 hover:[&_svg]:text-purple-600"
				onClick={openQRModal}
				title="Generate QR Code"
			>
				<QrCode className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
