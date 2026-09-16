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
			<SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
				<SheetHeader className="shrink-0 border-b">
					<SheetTitle className="text-lg capitalize">
						{ticket?.name ?? "Ticket details"}
					</SheetTitle>
					<SheetDescription className="break-all font-mono text-xs">
						{ticket?.publicId ? `#${ticket.publicId}` : ""}
					</SheetDescription>
				</SheetHeader>
				<div className="flex-1 overflow-y-auto">
					{ticket && <PendingTicketViewModal ticket={ticket} />}
				</div>
			</SheetContent>
		</Sheet>
	);
}
