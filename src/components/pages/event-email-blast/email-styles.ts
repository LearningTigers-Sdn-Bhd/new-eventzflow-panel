// Header looks for the EventzFlow layout. Keep in step with EmailBlast::STYLES in the backend.
export const EMAIL_STYLES = [
	{ value: "general", label: "General", hint: "Event name in the header" },
	{ value: "announcement", label: "Announcement", hint: "Blue" },
	{ value: "important", label: "Important update", hint: "Orange alert" },
	{ value: "reminder", label: "Reminder", hint: "Teal bell" },
	{ value: "invitation", label: "Invitation", hint: "Violet calendar" },
	{ value: "offer", label: "Special offer", hint: "Amber gift" },
	{ value: "thanks", label: "Thank you", hint: "Green heart" },
] as const;
