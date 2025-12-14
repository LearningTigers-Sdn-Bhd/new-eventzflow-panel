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
	// Optional newly collected contact info to display
	newPhone?: string;
	newEmail?: string;
}

export function TicketConfirmation({
	ticketData,
	isLoading,
	onConfirm,
	onBack,
	newPhone,
	newEmail,
}: TicketConfirmationProps) {
	// Determine what to display (newly collected data takes priority)
	const displayEmail = newEmail || ticketData.email;
	const displayPhone = newPhone || ticketData.phone;

	return (
		<div className="space-y-4">
			<div className="space-y-2.5 rounded-lg border border-primary/20 bg-primary/5 p-4">
				<h3 className="font-semibold text-base">Ticket Found!</h3>
				<div className="space-y-1.5 text-sm">
					<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
						<span className="text-muted-foreground">Name:</span>
						<span className="break-words font-medium">{ticketData.name}</span>
					</div>
					<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
						<span className="text-muted-foreground">Email:</span>
						<span
							className={`break-all text-left font-medium ${!displayEmail ? "text-muted-foreground italic" : ""}`}
						>
							{displayEmail || "Not provided"}
						</span>
					</div>
					<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
						<span className="text-muted-foreground">Phone:</span>
						<span
							className={`break-words font-medium ${!displayPhone ? "text-muted-foreground italic" : ""}`}
						>
							{displayPhone || "Not provided"}
						</span>
					</div>
					<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
						<span className="text-muted-foreground">Ticket Type:</span>
						<span className="break-words font-medium">
							{ticketData.ticketType}
						</span>
					</div>
					<div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
						<span className="text-muted-foreground">Event:</span>
						<span className="break-words font-medium">
							{ticketData.eventName}
						</span>
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
					className="h-10 gap-2 px-5"
					disabled={isLoading}
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<Button
					onClick={onConfirm}
					className="h-10 flex-1"
					disabled={isLoading}
				>
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
