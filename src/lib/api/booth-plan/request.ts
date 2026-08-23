import { z } from "zod";

export const createBoothPlanSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	position: z.number().int().min(0).optional(),
	active: z.boolean().optional(),
	image: z.instanceof(File).optional(),
});

export const updateBoothPlanSchema = z.object({
	id: z.number().min(1, "Plan ID is required"),
	event_id: z.number().min(1, "Event ID is required"),
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	position: z.number().int().min(0).optional(),
	active: z.boolean().optional(),
	image: z.instanceof(File).optional(),
});

export const deleteBoothPlanSchema = z.object({
	id: z.number().min(1, "Plan ID is required"),
	event_id: z.number().min(1, "Event ID is required"),
});

export type CreateBoothPlanRequest = z.infer<typeof createBoothPlanSchema>;
export type UpdateBoothPlanRequest = z.infer<typeof updateBoothPlanSchema>;
export type DeleteBoothPlanRequest = z.infer<typeof deleteBoothPlanSchema>;
