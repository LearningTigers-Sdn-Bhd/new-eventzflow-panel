import { z } from "zod";

export const createResourceLeadSchema = z.object({
	resource_id: z.string().or(z.number()),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company: z.string().optional(),
});

export type CreateResourceLeadRequest = z.infer<
	typeof createResourceLeadSchema
>;
