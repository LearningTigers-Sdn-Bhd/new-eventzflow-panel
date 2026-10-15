import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient } from "@/utils/rest-api";
import type { UpdatePublicExhibitorTeamMemberInput } from "./request";
import type { PublicExhibitorKitTeamMembers } from "./response";

/**
 * No-login self-service: fetch an exhibitor kit's info + team members by its
 * public_id (the invite link's secret).
 * GET /v1/public/exhibitor_kits/:public_id/team_members
 */
export async function getPublicExhibitorKitTeamMembers(
	publicId: string,
): Promise<PublicExhibitorKitTeamMembers> {
	try {
		const response = await publicRestClient.get<{
			data: PublicExhibitorKitTeamMembers;
		}>(`v1/public/exhibitor_kits/${publicId}/team_members`);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * PATCH /v1/public/exhibitor_kits/:public_id/team_members
 */
export async function updatePublicExhibitorKitTeamMembers(
	publicId: string,
	teamMembers: UpdatePublicExhibitorTeamMemberInput[],
): Promise<PublicExhibitorKitTeamMembers> {
	try {
		const response = await publicRestClient.patch<{
			data: PublicExhibitorKitTeamMembers;
		}>(`v1/public/exhibitor_kits/${publicId}/team_members`, {
			exhibitor_team_members: teamMembers,
		});
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
