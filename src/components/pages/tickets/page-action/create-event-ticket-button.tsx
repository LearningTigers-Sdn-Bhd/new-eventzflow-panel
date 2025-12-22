import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import TicketForm from "./create-event-ticket-form";

export function TicketPageButton() {
	const { openDialog } = useDialog();
	const openTicketCreate = () => {
		openDialog({
			component: TicketForm,
			config: {
				size: "full",
				showCloseButton: true,
				title: "Create New Ticket",
				description: "Add a new ticket for this event",
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openTicketCreate}
				className="w-full rounded-none py-6 md:py-4 lg:w-auto"
			>
				<Plus className="h-4 w-4" />
				Create Ticket
			</Button>
		</div>
	);
}
