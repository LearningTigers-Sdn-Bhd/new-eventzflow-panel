import { z } from "zod";

export const seatingGroupScopeSchema = z.enum(["plan_only", "event_level"]);

export const createSeatingGroupSchema = z.object({
	name: z.string().min(1),
	scope: seatingGroupScopeSchema.default("plan_only"),
	notes: z.string().max(1000).optional().nullable(),
});

export const updateSeatingGroupSchema = z.object({
	name: z.string().min(1).optional(),
	scope: seatingGroupScopeSchema.optional(),
	notes: z.string().max(1000).optional().nullable(),
});

export const addSeatingGroupMemberSchema = z.object({
	participant_type: z.enum(["Ticket", "Visitor"]),
	participant_id: z.number(),
});

export const assignSeatingGroupToTableSchema = z.object({
	plan_object_id: z.number(),
});

export type CreateSeatingGroupRequest = z.infer<
	typeof createSeatingGroupSchema
>;
export type UpdateSeatingGroupRequest = z.infer<
	typeof updateSeatingGroupSchema
>;
export type AddSeatingGroupMemberRequest = z.infer<
	typeof addSeatingGroupMemberSchema
>;
export type AssignSeatingGroupToTableRequest = z.infer<
	typeof assignSeatingGroupToTableSchema
>;
