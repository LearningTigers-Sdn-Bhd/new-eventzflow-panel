import { restClient } from "@/utils/rest-api";
import {
	type AddMemberRequest,
	addMemberSchema,
	type UpdateMemberRequest,
	updateMemberSchema,
} from "./request";
import type { AvailableMember, GroupMember } from "./response";

/**
 * Get all members of a group
 */
export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
	return restClient.get<GroupMember[]>(`v1/groups/${groupId}/members`);
}

/**
 * Get available members for a group (members not yet added to group)
 */
export async function getAvailableGroupMembers(
	groupId: number,
): Promise<AvailableMember[]> {
	try {
		// Fetch all team members and current group members in parallel
		const [allMembers, groupMembers] = await Promise.all([
			restClient.get<AvailableMember[]>("v1/team_members"),
			restClient.get<GroupMember[]>(`v1/groups/${groupId}/members`),
		]);

		// Get set of already assigned member IDs
		const assignedMemberIds = new Set(
			groupMembers.map((m) => m.user_id.toString()),
		);

		// Filter out already assigned members and return only "member" role users
		return allMembers.filter(
			(member) =>
				!assignedMemberIds.has(member.id.toString()) &&
				member.role === "member",
		);
	} catch (error: unknown) {
		console.error("Error fetching available group members:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch available members";
		throw new Error(errorMessage);
	}
}

/**
 * Add a member to a group
 */
export async function addGroupMember(
	groupId: number,
	data: AddMemberRequest,
): Promise<GroupMember> {
	const validated = addMemberSchema.parse(data);
	return restClient.post<GroupMember>(`v1/groups/${groupId}/members`, {
		group_member: validated,
	});
}

/**
 * Update a group member (toggle manager access)
 */
export async function updateGroupMember(
	groupId: number,
	memberId: number,
	data: UpdateMemberRequest,
): Promise<GroupMember> {
	const validated = updateMemberSchema.parse(data);
	return restClient.patch<GroupMember>(
		`v1/groups/${groupId}/members/${memberId}`,
		{ group_member: validated },
	);
}

/**
 * Remove a member from a group
 */
export async function removeGroupMember(
	groupId: number,
	memberId: number,
): Promise<void> {
	await restClient.delete<void>(`v1/groups/${groupId}/members/${memberId}`);
}
