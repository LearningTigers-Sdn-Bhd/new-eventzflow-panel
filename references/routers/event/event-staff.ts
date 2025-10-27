import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedHttpClient } from "../../lib/http-client";
import { protectedProcedure, router } from "../../index";

// ============================================================================
// TYPES
// ============================================================================

// Backend response types
type BackendEventStaffResponse = {
	id: number;
	event_id: number;
	user_id: string;
	role: "event_admin" | "event_team_member";
	user: {
		id: string;
		email: string;
		full_name: string;
		phone: string | null;
		role: number; // 0=org_owner, 1=manager, 2=member
		status: number; // 1=active, 0=inactive
	};
};

type BackendUser = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
};

type BackendEventAssignment = {
	id: number;
	event_id: number;
	user_id: string;
	role: "event_admin" | "event_team_member";
	created_at: string;
	updated_at: string;
};

// Frontend types
export type EventStaffMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	globalRole: "org_owner" | "manager" | "member";
	eventRole: "event_admin" | "event_team_member";
	status: "active" | "inactive";
	assignmentId: number;
	createdAt: string;
	updatedAt: string;
};

export type AvailableTeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
};

// ============================================================================
// CONSTANTS
// ============================================================================

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

// ============================================================================
// TRANSFORMERS
// ============================================================================

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

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const getEventStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

const assignStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	userId: z.string().min(1, "User ID is required"),
	role: z.enum(["event_admin", "event_team_member"]),
});

const removeStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	userId: z.string().min(1, "User ID is required"),
});

const getAvailableTeamMembersSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

function handleApiError(error: any, context: string): never {
	console.error(`Error in ${context}:`, error);

	const statusCode = error.response?.status;

	if (statusCode === 401) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: `Unauthorized to ${context}`,
		});
	}

	if (statusCode === 403) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Only organization owners or managers can manage event staff",
		});
	}

	if (statusCode === 404) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Event or resource not found",
		});
	}

	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: error.message || `Failed to ${context}`,
	});
}

// ============================================================================
// ROUTER
// ============================================================================

export const eventStaffRouter = router({
	// Get all staff assigned to an event
	getEventStaff: protectedProcedure
		.input(getEventStaffSchema)
		.query(async ({ ctx, input }) => {
			try {
				const staffAssignments = await protectedHttpClient.get<
					BackendEventStaffResponse[]
				>(`v1/events/${input.eventId}/staff`, ctx.token);

				return staffAssignments.map(transformEventStaffMember);
			} catch (error: any) {
				handleApiError(error, "fetch event staff");
			}
		}),

	// Get available team members (not yet assigned to this event)
	getAvailableTeamMembers: protectedProcedure
		.input(getAvailableTeamMembersSchema)
		.query(async ({ ctx, input }) => {
			try {
				const [allMembers, eventResponse] = await Promise.all([
					protectedHttpClient.get<BackendUser[]>("v1/team_members", ctx.token),
					protectedHttpClient.get<{
						event_assignments?: Array<{ user_id: string }>;
					}>(`v1/events/${input.eventId}`, ctx.token),
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
		}),

	// Assign a staff member to an event
	assignStaff: protectedProcedure
		.input(assignStaffSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const assignment = await protectedHttpClient.post<BackendEventAssignment>(
					`v1/events/${input.eventId}/staff`,
					{
						staff_assignment: {
							user_id: input.userId,
							role: input.role,
						},
					},
					ctx.token,
				);

				return { success: true, assignment };
			} catch (error: any) {
				handleApiError(error, "assign staff member");
			}
		}),

	// Remove a staff member from an event
	removeStaff: protectedProcedure
		.input(removeStaffSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				await protectedHttpClient.delete(
					`v1/events/${input.eventId}/staff/${input.userId}`,
					ctx.token,
				);

				return { success: true };
			} catch (error: any) {
				handleApiError(error, "remove staff member");
			}
		}),

	// Update staff member role
	updateStaffRole: protectedProcedure
		.input(assignStaffSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const assignment = await protectedHttpClient.post<BackendEventAssignment>(
					`v1/events/${input.eventId}/staff`,
					{
						staff_assignment: {
							user_id: input.userId,
							role: input.role,
						},
					},
					ctx.token,
				);

				return { success: true, assignment };
			} catch (error: any) {
				handleApiError(error, "update staff role");
			}
		}),
});
