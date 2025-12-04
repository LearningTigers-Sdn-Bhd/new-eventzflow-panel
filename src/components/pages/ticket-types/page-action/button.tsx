"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreateTicketTypeForm } from "../create-ticket-type-form";

interface TicketTypePageButtonProps {
	eventId: string;
}

export function TicketTypePageButton({ eventId }: TicketTypePageButtonProps) {
	const { openDialog, closeDialog } = useDialog();

	const handleCreateClick = () => {
		openDialog({
			component: CreateTicketTypeForm,
			props: {
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Create Ticket Type",
				description: "Add a new ticket type for this event",
				size: "2xl",
			},
		});
	};

	return (
		<Button onClick={handleCreateClick} className="w-full gap-2 rounded-none lg:w-auto">
			<Plus className="h-4 w-4" />
			Add Ticket Type
		</Button>
	);
}
