import { restClient } from "@/utils/rest-api";
import {
	type AssignStaffRequest,
	assignStaffSchema,
	type GetAvailableTeamMembersRequest,
	type GetEventStaffRequest,
	getAvailableTeamMembersSchema,
	getEventStaffSchema,
	type RemoveStaffRequest,
	removeStaffSchema,
} from "./request";
import type {
	AssignStaffResponse,
	AvailableTeamMember,
	BackendEventAssignment,
	BackendEventStaffResponse,
	BackendUser,
	EventStaffMember,
	RemoveStaffResponse,
	UpdateStaffRoleResponse,
} from "./response";

// Constants
const ROLE_MAP: Record<number, "org_owner" | "manager" | "member"> = {
	0: "org_owner",
	1: "manager",
	2: "member",
} as const;

const STATUS_MAP: Record<number, "active" | "inactive"> = {
	1: "active",
	0: "inactive",
} as const;

const DEFAULT_ROLE = "member";
const DEFAULT_STATUS = "active";

// Transformers
function transformEventStaffMember(
	staffData: BackendEventStaffResponse,
): EventStaffMember {
	return {
		id: String(staffData.user.id), // Ensure ID is always a string
		full_name: staffData.user.full_name,
		email: staffData.user.email,
		phone: staffData.user.phone ?? undefined,
		globalRole: ROLE_MAP[staffData.user.role] ?? DEFAULT_ROLE,
		eventRole: staffData.role,
		status: STATUS_MAP[staffData.user.status] ?? DEFAULT_STATUS,
		assignmentId: staffData.id,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
}

// Error handler
function handleApiError(error: any, context: string): never {
	console.error(`Error in ${context}:`, error);
	throw new Error(error.message || `Failed to ${context}`);
}

/**
 * Get all staff assigned to an event
 */
export async function getEventStaff(
	data: GetEventStaffRequest,
): Promise<EventStaffMember[]> {
	try {
		const validated = getEventStaffSchema.parse(data);

		const staffAssignments = await restClient.get<BackendEventStaffResponse[]>(
			`v1/events/${validated.eventId}/staff`,
		);

		return staffAssignments.map(transformEventStaffMember);
	} catch (error: any) {
		handleApiError(error, "fetch event staff");
	}
}

/**
 * Get available team members (not yet assigned to this event)
 */
export async function getAvailableTeamMembers(
	data: GetAvailableTeamMembersRequest,
): Promise<AvailableTeamMember[]> {
	try {
		const validated = getAvailableTeamMembersSchema.parse(data);

		const [allMembers, eventResponse] = await Promise.all([
			restClient.get<BackendUser[]>("v1/team_members"),
			restClient.get<{
				event_assignments?: Array<{ user_id: string }>;
			}>(`v1/events/${validated.eventId}`),
		]);

		const assignedUserIds = new Set(
			eventResponse.event_assignments?.map((a) => a.user_id) ?? [],
		);

		return allMembers
			.filter((member) => !assignedUserIds.has(member.id))
			.map(
				(member): AvailableTeamMember => ({
					id: member.id,
					full_name: member.full_name,
					email: member.email,
					phone: member.phone,
					role: member.role,
					status: member.status,
				}),
			);
	} catch (error: any) {
		handleApiError(error, "fetch available team members");
	}
}

/**
 * Assign a staff member to an event
 */
export async function assignStaff(
	data: AssignStaffRequest,
): Promise<AssignStaffResponse> {
	try {
		const validated = assignStaffSchema.parse(data);

		const assignment = await restClient.post<BackendEventAssignment>(
			`v1/events/${validated.eventId}/staff`,
			{
				staff_assignment: {
					user_id: validated.userId,
					role: validated.role,
				},
			},
		);

		return { success: true, assignment };
	} catch (error: any) {
		handleApiError(error, "assign staff member");
	}
}

/**
 * Remove a staff member from an event
 */
export async function removeStaff(
	data: RemoveStaffRequest,
): Promise<RemoveStaffResponse> {
	try {
		const validated = removeStaffSchema.parse(data);

		await restClient.delete(
			`v1/events/${validated.eventId}/staff/${validated.userId}`,
		);

		return { success: true };
	} catch (error: any) {
		handleApiError(error, "remove staff member");
	}
}

/**
 * Update staff member role
 */
export async function updateStaffRole(
	data: AssignStaffRequest,
): Promise<UpdateStaffRoleResponse> {
	try {
		const validated = assignStaffSchema.parse(data);

		const assignment = await restClient.post<BackendEventAssignment>(
			`v1/events/${validated.eventId}/staff`,
			{
				staff_assignment: {
					user_id: validated.userId,
					role: validated.role,
				},
			},
		);

		return { success: true, assignment };
	} catch (error: any) {
		handleApiError(error, "update staff role");
	}
}
