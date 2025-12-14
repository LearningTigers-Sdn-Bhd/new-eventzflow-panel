import { Mail, Phone, QrCode, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckInMethod = "email" | "phone" | "name" | "scan";

interface CheckInMethodSelectionProps {
	onSelectMethod: (method: CheckInMethod) => void;
	onRegisterClick: () => void;
}

export function CheckInMethodSelection({
	onSelectMethod,
	onRegisterClick,
}: CheckInMethodSelectionProps) {
	return (
		<div className="space-y-3">
			{/* Check-in Methods - More Compact Design */}
			<div className="grid grid-cols-2 gap-2.5">
				<Button
					onClick={() => onSelectMethod("email")}
					variant="outline"
					className="group flex h-auto flex-col items-center gap-1.5 py-4 transition-all hover:border-primary hover:bg-primary/5"
				>
					<Mail className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
					<div className="space-y-0.5">
						<span className="block font-semibold text-sm">Email</span>
						<span className="block text-muted-foreground text-xs leading-tight">
							Check-in by email
						</span>
					</div>
				</Button>

				<Button
					onClick={() => onSelectMethod("phone")}
					variant="outline"
					className="group flex h-auto flex-col items-center gap-1.5 py-4 transition-all hover:border-primary hover:bg-primary/5"
				>
					<Phone className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
					<div className="space-y-0.5">
						<span className="block font-semibold text-sm">Phone</span>
						<span className="block text-muted-foreground text-xs leading-tight">
							Check-in by phone
						</span>
					</div>
				</Button>

				<Button
					onClick={() => onSelectMethod("name")}
					variant="outline"
					className="group flex h-auto flex-col items-center gap-1.5 py-4 transition-all hover:border-primary hover:bg-primary/5"
				>
					<User className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
					<div className="space-y-0.5">
						<span className="block font-semibold text-sm">Name</span>
						<span className="block text-muted-foreground text-xs leading-tight">
							Check-in by name
						</span>
					</div>
				</Button>

				<Button
					onClick={() => onSelectMethod("scan")}
					variant="outline"
					className="group flex h-auto flex-col items-center gap-1.5 py-4 transition-all hover:border-primary hover:bg-primary/5"
				>
					<QrCode className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
					<div className="space-y-0.5">
						<span className="block font-semibold text-sm">Scan</span>
						<span className="block text-muted-foreground text-xs leading-tight">
							Scan QR code
						</span>
					</div>
				</Button>
			</div>

			{/* Divider */}
			<div className="relative py-2">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-border/50 border-t" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-card px-3 text-muted-foreground text-xs">or</span>
				</div>
			</div>

			{/* Registration Prompt - Moved to Bottom */}
			<div className="space-y-2 rounded-lg border-2 border-muted-foreground/30 border-dashed bg-muted/30 p-3.5 text-center">
				<p className="font-medium text-foreground text-sm">
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
			<div className="border-border/50 border-t pt-2 text-center">
				<p className="text-muted-foreground/70 text-xs tracking-wide">
					<span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold text-primary text-transparent">
						EventzFlow
					</span>{" "}
					<span className="text-muted-foreground/60">by</span>{" "}
					<span className="font-semibold text-foreground/80">
						Sales Chatalyst
					</span>
				</p>
			</div>
		</div>
	);
}
