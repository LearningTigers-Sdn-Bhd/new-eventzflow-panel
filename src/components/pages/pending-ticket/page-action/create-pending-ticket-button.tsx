import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import PendingTicketForm from "./create-pending-ticket-form";

export function PendingTicketPageButton() {
	const { openDialog } = useDialog();
	const openPendingTicketCreate = () => {
		openDialog({
			component: PendingTicketForm,
			config: {
				title: "Create Pending Ticket",
				description: "Create a new pending ticket for your event.",
				size: "full",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openPendingTicketCreate}
				className="w-full rounded-none py-6 md:py-4 lg:w-auto"
			>
				<Plus className="h-4 w-4" />
				Create Pending Ticket
			</Button>
		</div>
	);
}
