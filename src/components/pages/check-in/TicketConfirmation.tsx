import { ArrowLeft, Loader2 } from "lucide-react";
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

interface TicketConfirmationProps {
	ticketData: TicketData;
	isLoading: boolean;
	onConfirm: () => void;
	onBack: () => void;
}

export function TicketConfirmation({ ticketData, isLoading, onConfirm, onBack }: TicketConfirmationProps) {
	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2.5">
				<h3 className="font-semibold text-base">Ticket Found!</h3>
				<div className="space-y-1.5 text-sm">
					<div className="flex flex-col sm:flex-row sm:justify-between gap-1">
						<span className="text-muted-foreground">Name:</span>
						<span className="font-medium break-words">{ticketData.name}</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between gap-1">
						<span className="text-muted-foreground">Email:</span>
						<span className="font-medium break-all text-left">{ticketData.email}</span>
					</div>
					{ticketData.phone && (
						<div className="flex flex-col sm:flex-row sm:justify-between gap-1">
							<span className="text-muted-foreground">Phone:</span>
							<span className="font-medium break-words">{ticketData.phone}</span>
						</div>
					)}
					<div className="flex flex-col sm:flex-row sm:justify-between gap-1">
						<span className="text-muted-foreground">Ticket Type:</span>
						<span className="font-medium break-words">{ticketData.ticketType}</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between gap-1">
						<span className="text-muted-foreground">Event:</span>
						<span className="font-medium break-words">{ticketData.eventName}</span>
					</div>
				</div>
			</div>

			<p className="text-center text-muted-foreground text-xs">
				Please confirm this is your ticket to proceed with check-in
			</p>

			<div className="flex gap-2.5">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					className="gap-2 h-10 px-5"
					disabled={isLoading}
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<Button onClick={onConfirm} className="flex-1 h-10" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Checking In...
						</>
					) : (
						"Confirm Check-In"
					)}
				</Button>
			</div>
		</div>
	);
}
