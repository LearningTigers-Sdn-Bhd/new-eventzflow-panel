import { ArrowLeft, Loader2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MissingDataFormProps {
	ticketData: {
		name: string;
		email: string;
		phone?: string;
	};
	phoneValue: string;
	emailValue: string;
	onPhoneChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
	isLoading: boolean;
	requirePhone: boolean;
	requireEmail: boolean;
}

export function MissingDataForm({
	ticketData,
	phoneValue,
	emailValue,
	onPhoneChange,
	onEmailChange,
	onSubmit,
	onBack,
	isLoading,
	requirePhone,
	requireEmail,
}: MissingDataFormProps) {
	const missingPhone = !ticketData.phone;
	const missingEmail = !ticketData.email;

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{/* Info Banner */}
			<div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4">
				<div className="space-y-2">
					<p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
						📋 Complete Your Information
					</p>
					<p className="text-xs text-amber-800 dark:text-amber-200">
						Hi <span className="font-semibold">{ticketData.name}</span>! Before checking in, we need to
						collect some missing contact information for event updates and communication.
					</p>
				</div>
			</div>

			{/* Phone Number Field */}
			{missingPhone && (
				<div className="space-y-2">
					<Label htmlFor="missing-phone" className="flex items-center gap-2 text-sm font-medium">
						<Phone className="h-4 w-4" />
						Phone Number
						<span className="text-sm font-normal text-blue-600 dark:text-blue-400">(Recommended)</span>
					</Label>
					<Input
						id="missing-phone"
						type="tel"
						placeholder="0123456789"
						value={phoneValue}
						onChange={(e) => onPhoneChange(e.target.value)}
						disabled={isLoading}
						autoComplete="tel"
						autoFocus
						className="h-10"
					/>
					<p className="text-muted-foreground text-xs">
						We need your phone number for event updates and emergency contact
					</p>
				</div>
			)}

			{/* Email Field */}
			{missingEmail && (
				<div className="space-y-2">
					<Label htmlFor="missing-email" className="flex items-center gap-2 text-sm font-medium">
						<Mail className="h-4 w-4" />
						Email Address (Optional) {requireEmail && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id="missing-email"
						type="email"
						placeholder="you@example.com"
						value={emailValue}
						onChange={(e) => onEmailChange(e.target.value)}
						disabled={isLoading}
						autoComplete="email"
						autoFocus={!missingPhone}
						className="h-10"
						required={requireEmail}
					/>
					<p className="text-muted-foreground text-xs">
						{requireEmail
							? "Required: We'll send you event confirmations and updates"
							: "Optional: Receive event updates and future invitations"}
					</p>
				</div>
			)}

			{/* Action Buttons */}
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
				<Button type="submit" className="flex-1 h-10" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Checking In...
						</>
					) : (
						"Continue to Check-In"
					)}
				</Button>
			</div>
		</form>
	);
}
