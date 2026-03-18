type ExhibitorManagementEvent = {
	enable_exhibitor_management: boolean;
};

type ExhibitorManagementRole = string | undefined;

type ExhibitorManagementTab =
	| "exhibitor-info"
	| "rentable-items"
	| "printing-services"
	| "custom-requests";

export function isExhibitorManagementEnabled(
	role?: ExhibitorManagementRole,
	event?: ExhibitorManagementEvent | null,
) {
	return role === "org_owner" || event?.enable_exhibitor_management === true;
}

export function canManageExhibitorContractorAction(
	role?: string,
	event?: ExhibitorManagementEvent | null,
) {
	return role === "org_owner" && isExhibitorManagementEnabled(role, event);
}

export function shouldLoadExhibitorManagementData(
	role?: ExhibitorManagementRole,
	event?: ExhibitorManagementEvent | null,
) {
	return isExhibitorManagementEnabled(role, event);
}

export function shouldShowExhibitorManagementLockedState(
	activeTab: ExhibitorManagementTab,
	role?: ExhibitorManagementRole,
	event?: ExhibitorManagementEvent | null,
) {
	return (
		isExhibitorManagementProtectedTab(activeTab) &&
		!isExhibitorManagementEnabled(role, event)
	);
}

export function isExhibitorManagementProtectedTab(
	activeTab: ExhibitorManagementTab,
) {
	return new Set<ExhibitorManagementTab>([
		"rentable-items",
		"printing-services",
		"custom-requests",
	]).has(activeTab);
}

export function shouldShowEmbeddedExhibitorManagementSections(
	role?: ExhibitorManagementRole,
	event?: ExhibitorManagementEvent | null,
) {
	return isExhibitorManagementEnabled(role, event);
}

export function shouldExpandEmbeddedTeamMembersSection(
	role?: ExhibitorManagementRole,
	event?: ExhibitorManagementEvent | null,
) {
	return !shouldShowEmbeddedExhibitorManagementSections(role, event);
}
