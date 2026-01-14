import { z } from "zod";

export const getPermissionContextSchema = z.object({
	userId: z.string().or(z.number()),
});

export type GetPermissionContextRequest = z.infer<
	typeof getPermissionContextSchema
>;
