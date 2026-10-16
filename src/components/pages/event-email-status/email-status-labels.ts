import type { EmailStatus } from "@/lib/api/event-email-status";

export const EMAIL_TYPE_LABELS: Record<string, string> = {
	confirmation_email: "Ticket confirmation",
	payment_pending_email: "Payment reminder",
	group_confirmation_email: "Group confirmation",
	voucher_showcase_email: "Voucher",
	business_matching_email: "Business matching",
	registration_received_email: "Exhibitor registration",
	payment_confirmed_email: "Exhibitor payment",
	acknowledgement: "Application received",
	rejection: "Application rejected",
	rsvp_invitation: "RSVP invitation",
};

export function emailTypeLabel(emailType: string): string {
	return (
		EMAIL_TYPE_LABELS[emailType] ??
		emailType.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
	);
}

export const STATUS_LABELS: Record<EmailStatus, string> = {
	queued: "Pending",
	sending: "Pending",
	sent: "Sent",
	delivered: "Delivered",
	failed: "Failed",
	bounced: "Bounced",
	complained: "Marked as spam",
	suppressed: "Invalid address",
};

// Plain-language reason shown to organizers; provider detail stays admin-only.
export function problemReason(
	status: EmailStatus,
	problem: string | null,
): string | null {
	if (problem === "invalid_recipient")
		return "This email address can't receive mail";
	if (status === "suppressed" || problem === "suppressed") {
		return "This address previously bounced or blocked us";
	}
	if (status === "bounced") return "The mailbox rejected the email";
	if (status === "complained") return "Recipient marked it as spam";
	if (status === "failed") return "We couldn't send this email";
	return null;
}

// Addresses that need fixing, not just another try.
export function needsAddressFix(status: EmailStatus): boolean {
	return status === "bounced" || status === "suppressed";
}
