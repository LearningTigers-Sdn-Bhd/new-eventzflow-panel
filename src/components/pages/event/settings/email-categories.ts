// ponytail: mirrors EventEmailSetting::CATEGORIES keys/labels/groups in the
// backend (eventz-flow-backend/app/models/event_email_setting.rb). Keep both
// lists in sync by hand — only ~10 static entries, not worth a shared-schema
// endpoint.
//
// Note: the day-of event reminder (EventReminderMailer#reminder) has no
// entry here — it's already controlled by the "Event Reminder" settings tab
// (Event#reminders_enabled), no need for a second toggle.
export type EmailCategoryGroup = "ticket" | "exhibitor" | "general";

export const EMAIL_CATEGORY_GROUPS: {
	key: EmailCategoryGroup;
	label: string;
}[] = [
	{ key: "ticket", label: "Ticket" },
	{ key: "exhibitor", label: "Exhibitor" },
	{ key: "general", label: "General" },
];

export const EMAIL_CATEGORIES: {
	key: string;
	label: string;
	group: EmailCategoryGroup;
}[] = [
	{
		key: "ticket_confirmation",
		label: "Ticket Confirmation (paid)",
		group: "ticket",
	},
	{
		key: "ticket_payment_pending",
		label: "Unpaid Ticket Notice",
		group: "ticket",
	},
	{
		key: "payment_pending_reminder",
		label: "Unpaid Payment Reminder",
		group: "ticket",
	},
	{ key: "certificate", label: "E-Certificate", group: "ticket" },
	{
		key: "voucher_showcase",
		label: "Voucher Showcase Follow-up",
		group: "ticket",
	},
	{
		key: "ticket_application",
		label: "Ticket Application (RSVP)",
		group: "ticket",
	},
	{
		key: "exhibitor_registration_received",
		label: "Exhibitor Registration Received (unpaid)",
		group: "exhibitor",
	},
	{
		key: "exhibitor_payment_confirmed",
		label: "Exhibitor Payment Confirmed (paid)",
		group: "exhibitor",
	},
	{
		key: "exhibitor_welcome",
		label: "Exhibitor Portal Welcome",
		group: "exhibitor",
	},
	{
		key: "exhibitor_access_link",
		label: "Exhibitor Portal Access Link",
		group: "exhibitor",
	},
	{
		key: "booking",
		label: "Session Booking (Business Matching)",
		group: "general",
	},
];
