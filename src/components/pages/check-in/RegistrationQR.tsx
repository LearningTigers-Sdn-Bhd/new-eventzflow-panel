import { ArrowLeft } from "lucide-react";
import QRCodeSVG from "react-qr-code";
import { Button } from "@/components/ui/button";

interface RegistrationQRProps {
	onBack: () => void;
}

const REGISTRATION_LINK =
	"https://wa.me/601161753725?text=Register+for+SME+EXPO+and+AI+Summit+2025+%5BPlease+press+%2ASEND%2A+directly%5D";

export function RegistrationQR({ onBack }: RegistrationQRProps) {
	return (
		<div className="space-y-4">
			{/* QR Code Display - Centered and Prominent */}
			<div className="flex justify-center py-2">
				<div className="inline-block rounded-xl border-4 border-primary bg-white p-4 shadow-lg">
					<QRCodeSVG
						value={REGISTRATION_LINK}
						size={220}
						level="H"
						style={{ height: "auto", maxWidth: "100%", width: "100%" }}
						fgColor="#000000"
						bgColor="#ffffff"
					/>
				</div>
			</div>

			{/* Simple Instructions */}
			<div className="text-center">
				<p className="text-muted-foreground text-sm leading-relaxed">
					Open your camera app and point it at the QR code to register.
				</p>
			</div>

			{/* Back Button */}
			<div className="pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					className="w-full gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Check-In
				</Button>
			</div>

			{/* Footer Note */}
			<div className="text-center">
				<p className="text-muted-foreground/70 text-xs">
					Already registered? Go back to check in
				</p>
			</div>
		</div>
	);
}
