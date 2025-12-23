import { z } from "zod";

// Validation schema for getting event staff
export const getEventStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for assigning staff
export const assignStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	userId: z.string().min(1, "User ID is required"),
	role: z.enum(["event_admin", "event_team_member", "business_host"]),
});

// Validation schema for removing staff
export const removeStaffSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	userId: z.string().min(1, "User ID is required"),
});

// Validation schema for getting available team members
export const getAvailableTeamMembersSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Type exports for request data
export type GetEventStaffRequest = z.infer<typeof getEventStaffSchema>;
export type AssignStaffRequest = z.infer<typeof assignStaffSchema>;
export type RemoveStaffRequest = z.infer<typeof removeStaffSchema>;
export type GetAvailableTeamMembersRequest = z.infer<
	typeof getAvailableTeamMembersSchema
>;
