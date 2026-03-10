import type { RsvpCompanionRequest } from "@/lib/api/rsvp";
import type { CompanionFieldKey } from "./companion-fields";

export interface CompanionDraft extends RsvpCompanionRequest {
	id: string;
}

let companionDraftSequence = 0;

function createDraftId() {
	companionDraftSequence += 1;
	return `companion-draft-${companionDraftSequence}`;
}

export function createCompanionDraft(
	companion?: Partial<RsvpCompanionRequest>,
): CompanionDraft {
	return {
		id: createDraftId(),
		full_name: companion?.full_name ?? "",
		phone: companion?.phone ?? "",
		email: companion?.email ?? "",
	};
}

export function createCompanionDrafts(
	companions: RsvpCompanionRequest[],
): CompanionDraft[] {
	if (companions.length === 0) {
		return [createCompanionDraft()];
	}

	return companions.map((companion) => createCompanionDraft(companion));
}

export function appendCompanionDraft(
	companions: CompanionDraft[],
): CompanionDraft[] {
	return [...companions, createCompanionDraft()];
}

export function removeCompanionDraft(
	companions: CompanionDraft[],
	id: string,
): CompanionDraft[] {
	return companions.filter((companion) => companion.id !== id);
}

export function updateCompanionDraft(
	companions: CompanionDraft[],
	id: string,
	field: CompanionFieldKey,
	value: string,
): CompanionDraft[] {
	return companions.map((companion) =>
		companion.id === id ? { ...companion, [field]: value } : companion,
	);
}

export function toCompanionRequests(
	companions: CompanionDraft[],
): RsvpCompanionRequest[] {
	return companions.map(({ id: _id, ...companion }) => companion);
}
