import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketData {
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketType: string;
	eventName: string;
	checkedIn: boolean;
}

interface TicketSelectionProps {
	tickets: TicketData[];
	onSelectTicket: (ticket: TicketData) => void;
	onBack: () => void;
}

export function TicketSelection({ tickets, onSelectTicket, onBack }: TicketSelectionProps) {
	return (
		<div className="space-y-4">
			<p className="text-center text-muted-foreground text-sm">
				We found {tickets.length} ticket{tickets.length > 1 ? "s" : ""} matching your search. Please
				select yours:
			</p>

			<div className="max-h-[400px] space-y-3 overflow-y-auto">
				{tickets.map((ticket) => (
					<button
						key={ticket.publicId}
						onClick={() => onSelectTicket(ticket)}
						disabled={ticket.checkedIn}
						className={`w-full rounded-lg border p-4 text-left transition-all ${
							ticket.checkedIn
								? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900"
								: "cursor-pointer border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10"
						}`}
					>
						<div className="space-y-2">
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1">
									<p className="font-semibold text-base">{ticket.name}</p>
									<p className="text-muted-foreground text-sm">{ticket.email}</p>
									{ticket.phone && <p className="text-muted-foreground text-sm">{ticket.phone}</p>}
								</div>
								{ticket.checkedIn && (
									<span className="rounded bg-red-50 px-2 py-1 font-medium text-red-600 text-xs dark:bg-red-950 dark:text-red-400">
										Already Checked In
									</span>
								)}
							</div>
							<div className="flex flex-wrap gap-2 text-xs">
								<span className="rounded bg-primary/10 px-2 py-1 text-primary">{ticket.ticketType}</span>
								<span className="rounded bg-secondary px-2 py-1 text-secondary-foreground">
									{ticket.eventName}
								</span>
							</div>
						</div>
					</button>
				))}
			</div>

			<Button type="button" variant="outline" onClick={onBack} className="h-10 w-full gap-2">
				<ArrowLeft className="h-4 w-4" />
				Back to Search
			</Button>
		</div>
	);
}
