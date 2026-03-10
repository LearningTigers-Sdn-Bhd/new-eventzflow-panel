function clean(value: string | null | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

export function buildRsvpPageTitle(eventName?: string | null) {
	const safeEventName = clean(eventName);
	return safeEventName
		? `Invitation RSVP - ${safeEventName}`
		: "Invitation RSVP";
}
