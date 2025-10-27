import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import PendingTicketForm from "./ticket-form";

export function PendingTicketPageButton() {
	const { openDialog } = useDialog();
	const openPendingTicketCreate = () => {
		openDialog({
			component: PendingTicketForm,
			config: {
				title: "Create Pending Ticket",
				description: "Create a new pending ticket for your event.",
				size: "full",
				showCloseButton: false,
			},
		});
	};

	return (
		<div className="flex items-center gap-2">
			<Button variant="outline" onClick={openPendingTicketCreate}>
				<Plus className="h-4 w-4" />
				Create Pending Ticket
			</Button>
		</div>
	);
}
