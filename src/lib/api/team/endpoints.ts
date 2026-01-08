import { restClient } from "@/utils/rest-api";
import {
	type CreateTeamMemberRequest,
	createTeamMemberSchema,
	type DeleteMemberRequest,
	deleteMemberSchema,
	type ToggleMemberStatusRequest,
	toggleMemberStatusSchema,
	type UpdateTeamMemberRequest,
	updateTeamMemberSchema,
} from "./request";
import type {
	BackendTeamMember,
	CreateTeamMemberResponse,
	DeleteMemberResponse,
	TeamMember,
	ToggleMemberStatusResponse,
	UpdateTeamMemberResponse,
} from "./response";

// Transform backend response to frontend format
function transformTeamMember(backendMember: BackendTeamMember): TeamMember {
	return {
		id: backendMember.id,
		full_name: backendMember.full_name,
		email: backendMember.email,
		phone: backendMember.phone,
		role: backendMember.role,
		status: backendMember.status,
		createdAt: backendMember.created_at,
		updatedAt: backendMember.updated_at,
		createdById: backendMember.created_by_id,
		emailVerifiedAt: backendMember.email_verified_at,
	};
}

/**
 * Get all team members
 */
export async function getTeamMembers(filters?: {
	excludeResourcePermissions?: boolean;
}): Promise<TeamMember[]> {
	try {
		const searchParams = new URLSearchParams();
		if (filters?.excludeResourcePermissions) {
			searchParams.append("exclude_resource_permissions", "true");
		}

		const response = await restClient.get<BackendTeamMember[]>(
			`v1/team_members?${searchParams.toString()}`,
		);
		return response.map(transformTeamMember);
	} catch (error: unknown) {
		console.error("Error fetching team members:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch team members";
		throw new Error(errorMessage);
	}
}

/**
 * Get members created by a specific organizer
 * This is used by org_owners to view members under a specific organizer
 */
export async function getOrganizerMembers(
	organizerId: string,
): Promise<TeamMember[]> {
	try {
		// Use the dedicated backend endpoint for fetching organizer's members
		const response = await restClient.get<BackendTeamMember[]>(
			`v1/team_members/organizer/${organizerId}`,
		);

		return response.map(transformTeamMember);
	} catch (error: unknown) {
		console.error("Error fetching organizer members:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch organizer members";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new team member
 */
export async function createTeamMember(
	data: CreateTeamMemberRequest,
): Promise<CreateTeamMemberResponse> {
	try {
		const validated = createTeamMemberSchema.parse(data);

		const response = await restClient.post<BackendTeamMember>(
			"v1/team_members",
			{
				team_member: {
					full_name: validated.full_name,
					email: validated.email,
					phone: validated.phone,
					password: validated.password,
					password_confirmation: validated.password,
					role: validated.role,
				},
			},
		);

		return {
			success: true,
			member: transformTeamMember(response),
		};
	} catch (error: unknown) {
		console.error("Error creating team member:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create team member";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing team member
 */
export async function updateTeamMember(
	data: UpdateTeamMemberRequest,
): Promise<UpdateTeamMemberResponse> {
	try {
		const validated = updateTeamMemberSchema.parse(data);

		const updateData: {
			team_member: {
				full_name: string;
				email: string;
				phone?: string;
				role?: string;
				password?: string;
				password_confirmation?: string;
				email_verified_at?: string | null;
			};
		} = {
			team_member: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
				role: validated.role,
			},
		};

		// Only include password if provided
		if (validated.newPassword) {
			const password = validated.newPassword;
			updateData.team_member.password = password;
			updateData.team_member.password_confirmation = password;
		}

		// Include email_verified_at if explicitly provided (including null for revoke)
		if (validated.email_verified_at !== undefined) {
			updateData.team_member.email_verified_at = validated.email_verified_at;
		}

		const response = await restClient.put<BackendTeamMember>(
			`v1/team_members/${validated.id}`,
			updateData,
		);

		return {
			success: true,
			member: transformTeamMember(response),
		};
	} catch (error: unknown) {
		console.error("Error updating team member:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update team member";
		throw new Error(errorMessage);
	}
}

/**
 * Toggle team member status (active/inactive)
 */
export async function toggleMemberStatus(
	data: ToggleMemberStatusRequest,
): Promise<ToggleMemberStatusResponse> {
	try {
		const validated = toggleMemberStatusSchema.parse(data);

		const response = await restClient.patch<BackendTeamMember>(
			`v1/team_members/${validated.id}/toggle_status`,
			{ status: validated.status },
		);

		return {
			success: true,
			member: transformTeamMember(response),
		};
	} catch (error: unknown) {
		console.error("Error toggling team member status:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to update team member status";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a team member
 */
export async function deleteMember(
	data: DeleteMemberRequest,
): Promise<DeleteMemberResponse> {
	try {
		const validated = deleteMemberSchema.parse(data);

		const response = await restClient.delete<BackendTeamMember>(
			`v1/team_members/${validated.id}`,
		);

		return {
			success: true,
			member: transformTeamMember(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting team member:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete team member";
		throw new Error(errorMessage);
	}
}
