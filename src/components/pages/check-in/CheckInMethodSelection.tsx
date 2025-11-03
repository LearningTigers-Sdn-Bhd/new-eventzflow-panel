import { Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckInMethod = "email" | "phone" | "name";

interface CheckInMethodSelectionProps {
	onSelectMethod: (method: CheckInMethod) => void;
}

export function CheckInMethodSelection({ onSelectMethod }: CheckInMethodSelectionProps) {
	return (
		<div className="space-y-3">
			<Button
				onClick={() => onSelectMethod("email")}
				variant="outline"
				className="w-full h-auto py-5 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
			>
				<Mail className="h-8 w-8 text-primary" />
				<div className="space-y-0.5">
					<p className="font-semibold text-sm">Check in with Email</p>
					<p className="text-muted-foreground text-xs">
						Use the email address from your ticket
					</p>
				</div>
			</Button>

			<Button
				onClick={() => onSelectMethod("phone")}
				variant="outline"
				className="w-full h-auto py-5 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
			>
				<Phone className="h-8 w-8 text-primary" />
				<div className="space-y-0.5">
					<p className="font-semibold text-sm">Check in with Phone Number</p>
					<p className="text-muted-foreground text-xs">
						Use the phone number from your ticket
					</p>
				</div>
			</Button>

			<Button
				onClick={() => onSelectMethod("name")}
				variant="outline"
				className="w-full h-auto py-5 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
			>
				<User className="h-8 w-8 text-primary" />
				<div className="space-y-0.5">
					<p className="font-semibold text-sm">Check in with Name</p>
					<p className="text-muted-foreground text-xs">
						Use your first name, last name, or full name
					</p>
				</div>
			</Button>

			<div className="text-center pt-3 mt-2 border-t border-border/50">
				<p className="text-xs text-muted-foreground/70 tracking-wide">
					<span className="font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
						EventzFlow
					</span>
					{" "}
					<span className="text-muted-foreground/60">by</span>
					{" "}
					<span className="font-semibold text-foreground/80">Sales Chatalyst</span>
				</p>
			</div>
		</div>
	);
}
