export function getStatusCopy(status: string) {
	if (status === "paid") {
		return "Registration confirmed. Your QR ticket is ready.";
	}
	if (status === "pending") {
		return "Registration received. Please complete payment to confirm your ticket.";
	}
	return "Registration submitted. We will contact you with next steps.";
}
