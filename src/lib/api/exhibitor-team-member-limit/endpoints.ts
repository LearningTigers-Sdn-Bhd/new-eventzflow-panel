import { restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorTeamMemberLimitRequest,
	createExhibitorTeamMemberLimitSchema,
	type UpdateExhibitorTeamMemberLimitRequest,
	updateExhibitorTeamMemberLimitSchema,
} from "./request";
import type { ExhibitorTeamMemberLimit } from "./response";

/**
 * Get team member limit settings for an event
 * Returns null if not configured
 */
export async function getExhibitorTeamMemberLimit(
	eventId: number,
): Promise<ExhibitorTeamMemberLimit | null> {
	const response = await restClient.get<
		ExhibitorTeamMemberLimit | { data: null; is_configured: false }
	>(`v1/events/${eventId}/exhibitor_team_member_limit`);

	// Handle new backend response format
	if ("is_configured" in response && !response.is_configured) {
		return null;
	}

	return response as ExhibitorTeamMemberLimit;
}

/**
 * Create team member limit settings for an event
 */
export async function createExhibitorTeamMemberLimit(
	eventId: number,
	data: CreateExhibitorTeamMemberLimitRequest,
): Promise<ExhibitorTeamMemberLimit> {
	const validated = createExhibitorTeamMemberLimitSchema.parse(data);
	return restClient.post<ExhibitorTeamMemberLimit>(
		`v1/events/${eventId}/exhibitor_team_member_limit`,
		{ exhibitor_team_member_limit: validated },
	);
}

/**
 * Update team member limit settings for an event
 */
export async function updateExhibitorTeamMemberLimit(
	eventId: number,
	data: UpdateExhibitorTeamMemberLimitRequest,
): Promise<ExhibitorTeamMemberLimit> {
	const validated = updateExhibitorTeamMemberLimitSchema.parse(data);
	return restClient.patch<ExhibitorTeamMemberLimit>(
		`v1/events/${eventId}/exhibitor_team_member_limit`,
		{ exhibitor_team_member_limit: validated },
	);
}

/**
 * Delete team member limit settings for an event (makes it unlimited)
 */
export async function deleteExhibitorTeamMemberLimit(
	eventId: number,
): Promise<void> {
	await restClient.delete<void>(
		`v1/events/${eventId}/exhibitor_team_member_limit`,
	);
}
