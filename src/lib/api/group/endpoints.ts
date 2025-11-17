import { restClient } from "@/utils/rest-api";
import type { Group, GroupWithMembers } from "./response";
import {
	type CreateGroupRequest,
	type UpdateGroupRequest,
	createGroupSchema,
	updateGroupSchema,
} from "./request";

/**
 * Get all groups (filtered by role)
 */
export async function getGroups(): Promise<Group[]> {
	return restClient.get<Group[]>("v1/groups");
}

/**
 * Get group details with members
 */
export async function getGroup(id: number): Promise<GroupWithMembers> {
	return restClient.get<GroupWithMembers>(`v1/groups/${id}`);
}

/**
 * Create a new group (org_owner and organizer)
 */
export async function createGroup(data: CreateGroupRequest): Promise<Group> {
	const validated = createGroupSchema.parse(data);
	return restClient.post<Group>("v1/groups", { group: validated });
}

/**
 * Update an existing group
 */
export async function updateGroup(
	id: number,
	data: UpdateGroupRequest,
): Promise<Group> {
	const validated = updateGroupSchema.parse(data);
	return restClient.patch<Group>(`v1/groups/${id}`, { group: validated });
}

/**
 * Delete a group (org_owner only)
 */
export async function deleteGroup(id: number): Promise<void> {
	await restClient.delete<void>(`v1/groups/${id}`);
}

/**
 * Get all affiliates for a group
 */
export async function getGroupAffiliates(groupId: number) {
	return restClient.get(`v1/groups/${groupId}/affiliates`);
}

/**
 * Add a vendor to a group
 */
export async function addGroupAffiliate(groupId: number, vendorId: number) {
	return restClient.post(`v1/groups/${groupId}/affiliates`, {
		group_affiliate: { vendor_id: vendorId },
	});
}

/**
 * Remove a vendor from a group
 */
export async function removeGroupAffiliate(groupId: number, affiliateId: number): Promise<void> {
	await restClient.delete(`v1/groups/${groupId}/affiliates/${affiliateId}`);
}
