import { z } from "zod";

export const createResourceLeadSchema = z.object({
	resource_id: z.string().or(z.number()),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	phone: z.string().optional(),
	company_name: z.string().optional(),
	job_title: z.string().optional(),
	state: z.string().optional(),
	country: z.string().optional(),
});

export type CreateResourceLeadRequest = z.infer<
	typeof createResourceLeadSchema
>;
