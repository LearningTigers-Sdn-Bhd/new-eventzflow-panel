import type { SettingsTab } from "./navigation";

type EventSettingsRole = string | undefined;

export function canAccessPosterSettings(_role?: EventSettingsRole) {
	return true;
}

export function canConfigureAdvancedEventOptions(role?: EventSettingsRole) {
	return role !== "organizer";
}

export function canConfigureEventVisibility(role?: EventSettingsRole) {
	return role === "org_owner";
}

export function canConfigureExhibitorKit(role?: EventSettingsRole) {
	return role === "org_owner";
}

export function getSafeInitialSettingsTab(
	initialTab: SettingsTab,
): SettingsTab {
	return initialTab === "poster" ? "event-information" : initialTab;
}
