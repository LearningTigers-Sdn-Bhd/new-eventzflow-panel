"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import TicketViewModal from "./action-modals/event-ticket-view-modal";
import type { BaseTicket } from "./event-ticket-table-columns";

interface TicketDetailSheetProps {
	ticket: BaseTicket | null;
	onOpenChange: (open: boolean) => void;
}

export function TicketDetailSheet({
	ticket,
	onOpenChange,
}: TicketDetailSheetProps) {
	return (
		<Sheet open={Boolean(ticket)} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
				<SheetHeader className="border-b">
					<SheetTitle>{ticket?.name ?? "Ticket details"}</SheetTitle>
					<SheetDescription>
						{ticket?.publicId ? `Ticket #${ticket.publicId}` : ""}
					</SheetDescription>
				</SheetHeader>
				{ticket && <TicketViewModal ticket={ticket} />}
			</SheetContent>
		</Sheet>
	);
}
