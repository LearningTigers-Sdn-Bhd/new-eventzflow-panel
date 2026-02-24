function clean(value: string | null | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function humanizeSlug(value: string) {
	return value
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function buildPublicRegistrationLandingTitle(eventName?: string | null) {
	const safeEventName = clean(eventName);
	return safeEventName ? `Register - ${safeEventName}` : "Event Registration";
}

export function buildPublicRegistrationTypeTitle(
	eventName?: string | null,
	formNameOrSlug?: string | null,
) {
	const safeEventName = clean(eventName);
	const safeFormNameOrSlug = clean(formNameOrSlug);

	const registrationLabel = safeFormNameOrSlug
		? `${humanizeSlug(safeFormNameOrSlug)} Registration`
		: "Registration";

	if (!safeEventName && !safeFormNameOrSlug) {
		return "Event Registration";
	}

	return safeEventName
		? `${registrationLabel} - ${safeEventName}`
		: registrationLabel;
}
