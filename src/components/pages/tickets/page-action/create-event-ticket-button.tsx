import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import TicketForm from "./create-event-ticket-form";
import GuestPassesForm from "./create-guest-passes-form";

export function TicketPageButton() {
	const { openDialog } = useDialog();

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={() =>
					openDialog({
						component: GuestPassesForm,
						config: {
							size: "full",
							showCloseButton: true,
							title: "Create Guest Passes",
							description:
								"Placeholder passes for groups whose names aren't known or needed — rename later, or never.",
						},
					})
				}
				className="w-full rounded-none py-6 md:py-4 lg:w-auto"
			>
				<Users className="h-4 w-4" />
				Guest Passes
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					openDialog({
						component: TicketForm,
						config: {
							size: "full",
							showCloseButton: true,
							title: "Create New Ticket",
							description: "Add a new ticket for this event",
						},
					})
				}
				className="w-full rounded-none py-6 md:py-4 lg:w-auto"
			>
				<Plus className="h-4 w-4" />
				Create Ticket
			</Button>
		</div>
	);
}
