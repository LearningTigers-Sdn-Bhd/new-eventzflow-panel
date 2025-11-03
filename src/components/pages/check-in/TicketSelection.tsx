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
			<p className="text-sm text-muted-foreground text-center">
				We found {tickets.length} ticket{tickets.length > 1 ? "s" : ""} matching your search. Please
				select yours:
			</p>

			<div className="space-y-3 max-h-[400px] overflow-y-auto">
				{tickets.map((ticket) => (
					<button
						key={ticket.publicId}
						onClick={() => onSelectTicket(ticket)}
						disabled={ticket.checkedIn}
						className={`w-full text-left rounded-lg border p-4 transition-all ${
							ticket.checkedIn
								? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900"
								: "border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer"
						}`}
					>
						<div className="space-y-2">
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1">
									<p className="font-semibold text-base">{ticket.name}</p>
									<p className="text-sm text-muted-foreground">{ticket.email}</p>
									{ticket.phone && <p className="text-sm text-muted-foreground">{ticket.phone}</p>}
								</div>
								{ticket.checkedIn && (
									<span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
										Already Checked In
									</span>
								)}
							</div>
							<div className="flex flex-wrap gap-2 text-xs">
								<span className="bg-primary/10 text-primary px-2 py-1 rounded">{ticket.ticketType}</span>
								<span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
									{ticket.eventName}
								</span>
							</div>
						</div>
					</button>
				))}
			</div>

			<Button type="button" variant="outline" onClick={onBack} className="w-full gap-2 h-10">
				<ArrowLeft className="h-4 w-4" />
				Back to Search
			</Button>
		</div>
	);
}
