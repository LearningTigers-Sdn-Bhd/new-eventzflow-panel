import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedHttpClient } from "../lib/http-client";
import { protectedProcedure, router } from "../index";

// Backend API response type
type BackendTeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
};

// Frontend team member type
export type TeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
};

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
	};
}

// Validation schema for creating a team member
const createTeamMemberSchema = z.object({
	full_name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["manager", "member"]).default("member"),
});

// Validation schema for updating a team member
const updateTeamMemberSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
	full_name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	role: z.enum(["org_owner", "manager", "member"]).optional(),
	newPassword: z.string().optional(),
});

// Validation schema for toggling team member status
const toggleMemberStatusSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
	status: z.enum(["active", "inactive"]),
});

// Validation schema for deleting a team member
const deleteMemberSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
});

export const teamRouter = router({
	getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
		try {
			const response = await protectedHttpClient.get<BackendTeamMember[]>(
				"v1/team_members",
				ctx.token,
			);

			return response.map(transformTeamMember);
		} catch (error: any) {
			console.error("Error fetching team members:", error);
			
			if (error.response?.status === 401) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Unauthorized to access team members",
				});
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error.message || "Failed to fetch team members",
			});
		}
	}),

	createTeamMember: protectedProcedure
		.input(createTeamMemberSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.post<BackendTeamMember>(
					"v1/team_members",
					{
						team_member: {
							full_name: input.full_name,
							email: input.email,
							phone: input.phone,
							password: input.password,
							password_confirmation: input.password,
							role: input.role,
						},
					},
					ctx.token,
				);

				return {
					success: true,
					member: transformTeamMember(response),
				};
			} catch (error: any) {
				console.error("Error creating team member:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to create team members",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to create team member",
				});
			}
		}),

	updateTeamMember: protectedProcedure
		.input(updateTeamMemberSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const updateData: any = {
					team_member: {
						full_name: input.full_name,
						email: input.email,
						phone: input.phone,
						role: input.role,
					},
				};

				// Only include password if provided
				if (input.newPassword) {
					updateData.team_member.password = input.newPassword;
					updateData.team_member.password_confirmation = input.newPassword;
				}

				const response = await protectedHttpClient.put<BackendTeamMember>(
					`v1/team_members/${input.id}`,
					updateData,
					ctx.token,
				);

				return {
					success: true,
					member: transformTeamMember(response),
				};
			} catch (error: any) {
				console.error("Error updating team member:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to update team members",
					});
				}
				
				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Team member not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to update team member",
				});
			}
		}),

	toggleMemberStatus: protectedProcedure
		.input(toggleMemberStatusSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.patch<BackendTeamMember>(
					`v1/team_members/${input.id}/toggle_status`,
					{ status: input.status },
					ctx.token,
				);

				return {
					success: true,
					member: transformTeamMember(response),
				};
			} catch (error: any) {
				console.error("Error toggling team member status:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to update team member status",
					});
				}
				
				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Team member not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to update team member status",
				});
			}
		}),

	deleteMember: protectedProcedure
		.input(deleteMemberSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.delete<BackendTeamMember>(
					`v1/team_members/${input.id}`,
					ctx.token,
				);

				return {
					success: true,
					member: transformTeamMember(response),
				};
			} catch (error: any) {
				console.error("Error deleting team member:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to delete team members",
					});
				}
				
				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Team member not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to delete team member",
				});
			}
		}),
});
