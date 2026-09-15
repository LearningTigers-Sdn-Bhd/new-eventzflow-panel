"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import PendingTicketViewModal from "./action-modals/pending-ticket-view-modal";
import type { PendingTicket } from "./pending-ticket-table-columns";

interface PendingTicketDetailSheetProps {
	ticket: PendingTicket | null;
	onOpenChange: (open: boolean) => void;
}

export function PendingTicketDetailSheet({
	ticket,
	onOpenChange,
}: PendingTicketDetailSheetProps) {
	return (
		<Sheet open={Boolean(ticket)} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
				<SheetHeader className="border-b">
					<SheetTitle>{ticket?.name ?? "Ticket details"}</SheetTitle>
					<SheetDescription>
						{ticket?.publicId ? `Ticket #${ticket.publicId}` : ""}
					</SheetDescription>
				</SheetHeader>
				{ticket && <PendingTicketViewModal ticket={ticket} />}
			</SheetContent>
		</Sheet>
	);
}
