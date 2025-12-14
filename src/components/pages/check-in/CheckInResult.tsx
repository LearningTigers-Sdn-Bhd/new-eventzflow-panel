import { CheckCircle2, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultData {
	success: boolean;
	message: string;
	details?: {
		name?: string;
		email?: string;
		phone?: string;
		ticketType?: string;
		eventName?: string;
	};
}

interface CheckInResultProps {
	result: ResultData;
	onReset: () => void;
	onRegisterClick?: () => void;
}

export function CheckInResult({
	result,
	onReset,
	onRegisterClick,
}: CheckInResultProps) {
	return (
		<div className="space-y-4">
			<div
				className={`flex items-start gap-3 rounded-lg border p-4 ${
					result.success
						? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
						: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
				}`}
			>
				{result.success ? (
					<CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
				) : (
					<XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
				)}
				<div className="space-y-1">
					<p
						className={`font-semibold ${
							result.success
								? "text-emerald-900 dark:text-emerald-100"
								: "text-red-900 dark:text-red-100"
						}`}
					>
						{result.message}
					</p>
					{result.success && result.details && (
						<div className="space-y-0.5 text-emerald-700 text-sm dark:text-emerald-300">
							{result.details.name && (
								<p>
									<span className="font-medium">Name:</span>{" "}
									{result.details.name}
								</p>
							)}
							{result.details.email && (
								<p>
									<span className="font-medium">Email:</span>{" "}
									{result.details.email}
								</p>
							)}
							{result.details.phone && (
								<p>
									<span className="font-medium">Phone:</span>{" "}
									{result.details.phone}
								</p>
							)}
							{result.details.ticketType && (
								<p>
									<span className="font-medium">Ticket:</span>{" "}
									{result.details.ticketType}
								</p>
							)}
							{result.details.eventName && (
								<p>
									<span className="font-medium">Event:</span>{" "}
									{result.details.eventName}
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Registration Prompt - Show only on failure */}
			{!result.success && onRegisterClick && (
				<div className="space-y-2 rounded-lg border-2 border-muted-foreground/30 border-dashed bg-muted/30 p-3.5 text-center">
					<p className="font-medium text-foreground text-sm">
						Haven't registered yet?
					</p>
					<Button
						onClick={onRegisterClick}
						variant="secondary"
						size="sm"
						className="w-full gap-2 border border-primary hover:bg-primary hover:text-white"
					>
						<UserPlus className="h-4 w-4" />
						Click Here to Register
					</Button>
				</div>
			)}

			<Button onClick={onReset} variant="outline" className="h-10 w-full">
				Check In Another Attendee
			</Button>
		</div>
	);
}
