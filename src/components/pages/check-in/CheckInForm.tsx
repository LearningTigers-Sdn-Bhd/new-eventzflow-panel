import { Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NameSearchInput } from "./NameSearchInput";

type CheckInMethod = "email" | "phone" | "name";

interface TicketData {
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketType: string;
	eventName: string;
	checkedIn: boolean;
}

interface CheckInFormProps {
	checkInMethod: CheckInMethod;
	email: string;
	phone: string;
	name: string;
	isLoading: boolean;
	onEmailChange: (value: string) => void;
	onPhoneChange: (value: string) => void;
	onNameChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
	onTicketSelect?: (ticket: TicketData) => void;
}

export function CheckInForm({
	checkInMethod,
	email,
	phone,
	name,
	isLoading,
	onEmailChange,
	onPhoneChange,
	onNameChange,
	onSubmit,
	onBack,
	onTicketSelect,
}: CheckInFormProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{checkInMethod === "email" && (
				<div className="space-y-2">
					<Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
						<Mail className="h-4 w-4" />
						Email Address
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="attendee@example.com"
						value={email}
						onChange={(e) => onEmailChange(e.target.value)}
						disabled={isLoading}
						autoComplete="email"
						autoFocus
						className="h-10"
					/>
					<p className="text-muted-foreground text-xs">
						Enter the email used during ticket registration
					</p>
				</div>
			)}

			{checkInMethod === "phone" && (
				<div className="space-y-2">
					<Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
						<Phone className="h-4 w-4" />
						Phone Number
					</Label>
					<Input
						id="phone"
						type="tel"
						placeholder="0123456789"
						value={phone}
						onChange={(e) => onPhoneChange(e.target.value)}
						disabled={isLoading}
						autoComplete="tel"
						autoFocus
						className="h-10"
					/>
					<p className="text-muted-foreground text-xs">
						Enter your phone number in any format - we'll match it automatically
					</p>
				</div>
			)}

			{checkInMethod === "name" && onTicketSelect && (
				<NameSearchInput
					value={name}
					onChange={onNameChange}
					onTicketSelect={onTicketSelect}
					disabled={isLoading}
				/>
			)}

			<div className="flex gap-2.5 pt-1">
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
				<Button
					type="submit"
					className="flex-1 h-10"
					disabled={
						isLoading ||
						(checkInMethod === "email" && !email) ||
						(checkInMethod === "phone" && !phone) ||
						(checkInMethod === "name" && !name)
					}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Finding Ticket...
						</>
					) : (
						"Find Ticket"
					)}
				</Button>
			</div>
		</form>
	);
}
