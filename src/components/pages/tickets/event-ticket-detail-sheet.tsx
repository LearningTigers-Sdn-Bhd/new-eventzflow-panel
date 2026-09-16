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
					{ticket && <TicketViewModal ticket={ticket} />}
				</div>
			</SheetContent>
		</Sheet>
	);
}
