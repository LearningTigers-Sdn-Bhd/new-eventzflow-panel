import { z } from "zod";

export const createResourcePermissionSchema = z.object({
	user_id: z.string().or(z.number()),
	status: z.enum(["base", "partnership"]).optional(),
	is_official: z.boolean().optional(),
});

export const updateResourcePermissionSchema = z.object({
	id: z.string().min(1, "ID is required"),
	status: z.enum(["base", "partnership"]),
	is_official: z.boolean(),
});

export type CreateResourcePermissionRequest = z.infer<
	typeof createResourcePermissionSchema
>;
export type UpdateResourcePermissionRequest = z.infer<
	typeof updateResourcePermissionSchema
>;
