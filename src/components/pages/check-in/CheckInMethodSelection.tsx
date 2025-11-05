import { Mail, Phone, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckInMethod = "email" | "phone" | "name";

interface CheckInMethodSelectionProps {
	onSelectMethod: (method: CheckInMethod) => void;
	onRegisterClick: () => void;
}

export function CheckInMethodSelection({ onSelectMethod, onRegisterClick }: CheckInMethodSelectionProps) {
	return (
		<div className="space-y-3">
			{/* Check-in Methods - More Compact Design */}
			<div className="grid grid-cols-3 gap-2.5">
				<Button
					onClick={() => onSelectMethod("email")}
					variant="outline"
					className="h-auto py-4 flex flex-col items-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
				>
					<Mail className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
					<div className="space-y-0.5">
						<span className="font-semibold text-sm block">Email</span>
						<span className="text-xs text-muted-foreground leading-tight block">
							Check-in by email
						</span>
					</div>
				</Button>

				<Button
					onClick={() => onSelectMethod("phone")}
					variant="outline"
					className="h-auto py-4 flex flex-col items-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
				>
					<Phone className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
					<div className="space-y-0.5">
						<span className="font-semibold text-sm block">Phone</span>
						<span className="text-xs text-muted-foreground leading-tight block">
							Check-in by phone
						</span>
					</div>
				</Button>

				<Button
					onClick={() => onSelectMethod("name")}
					variant="outline"
					className="h-auto py-4 flex flex-col items-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
				>
					<User className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
					<div className="space-y-0.5">
						<span className="font-semibold text-sm block">Name</span>
						<span className="text-xs text-muted-foreground leading-tight block">
							Check-in by name
						</span>
					</div>
				</Button>
			</div>

			{/* Divider */}
			<div className="relative py-2">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border/50" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-card px-3 text-muted-foreground text-xs">
						or
					</span>
				</div>
			</div>

			{/* Registration Prompt - Moved to Bottom */}
			<div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-3.5 text-center space-y-2">
				<p className="font-medium text-sm text-foreground">
					Haven't registered yet?
				</p>
				<Button
					onClick={onRegisterClick}
					variant="secondary"
					size="sm"
					className="w-full gap-2 border border-primary hover:bg-primary hover:text-white dark:hover:text-black"
				>
					<UserPlus className="h-4 w-4" />
					Click Here to Register
				</Button>
				<p className="text-muted-foreground text-xs">
					Scan QR code to complete your registration
				</p>
			</div>

			{/* Footer */}
			<div className="text-center pt-2 border-t border-border/50">
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
