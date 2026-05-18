import { z } from "zod";

// Schema for creating team member limit settings
export const createExhibitorTeamMemberLimitSchema = z.object({
	team_member_limit: z.number().int().min(1, "Limit must be at least 1"),
	extra_team_member_fee: z.number().min(0, "Fee must be 0 or greater"),
});

// Schema for updating team member limit settings
export const updateExhibitorTeamMemberLimitSchema = z.object({
	team_member_limit: z
		.number()
		.int()
		.min(1, "Limit must be at least 1")
		.optional(),
	extra_team_member_fee: z
		.number()
		.min(0, "Fee must be 0 or greater")
		.optional(),
});

export type CreateExhibitorTeamMemberLimitRequest = z.infer<
	typeof createExhibitorTeamMemberLimitSchema
>;
export type UpdateExhibitorTeamMemberLimitRequest = z.infer<
	typeof updateExhibitorTeamMemberLimitSchema
>;
