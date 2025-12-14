import { restClient } from "@/utils/rest-api";
import { type CreateAffiliateRequest, createAffiliateSchema } from "./request";
import type { GroupAffiliate } from "./response";

/**
 * Get all affiliates for a group
 */
export async function getGroupAffiliates(
	groupId: number,
): Promise<GroupAffiliate[]> {
	return restClient.get<GroupAffiliate[]>(`v1/groups/${groupId}/affiliates`);
}

/**
 * Assign a vendor to a group (org_owner only)
 */
export async function createGroupAffiliate(
	groupId: number,
	data: CreateAffiliateRequest,
): Promise<GroupAffiliate> {
	const validated = createAffiliateSchema.parse(data);
	return restClient.post<GroupAffiliate>(`v1/groups/${groupId}/affiliates`, {
		group_affiliate: validated,
	});
}

/**
 * Remove a vendor from a group (org_owner only)
 */
export async function deleteGroupAffiliate(
	groupId: number,
	affiliateId: number,
): Promise<void> {
	await restClient.delete<void>(
		`v1/groups/${groupId}/affiliates/${affiliateId}`,
	);
}
