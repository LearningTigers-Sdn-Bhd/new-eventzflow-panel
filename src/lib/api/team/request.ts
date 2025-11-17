import { z } from "zod";

// Validation schema for creating a team member
export const createTeamMemberSchema = z.object({
	full_name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["organizer", "member"]).default("member"),
});

// Validation schema for updating a team member
export const updateTeamMemberSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
	full_name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	role: z.enum(["org_owner", "organizer", "member"]).optional(),
	newPassword: z.string().optional(),
});

// Validation schema for toggling team member status
export const toggleMemberStatusSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
	status: z.enum(["active", "inactive"]),
});

// Validation schema for deleting a team member
export const deleteMemberSchema = z.object({
	id: z.string().min(1, "Member ID is required"),
});

// Type exports for request data
export type CreateTeamMemberRequest = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberRequest = z.infer<typeof updateTeamMemberSchema>;
export type ToggleMemberStatusRequest = z.infer<
	typeof toggleMemberStatusSchema
>;
export type DeleteMemberRequest = z.infer<typeof deleteMemberSchema>;
