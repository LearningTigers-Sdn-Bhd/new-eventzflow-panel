import { z } from "zod";

export const SYSTEM_NOTICE_MAX_LENGTH = 300;

export const updateSystemNoticeSchema = z
	.object({
		message: z.string().trim().max(SYSTEM_NOTICE_MAX_LENGTH),
		active: z.boolean(),
	})
	.refine((value) => !value.active || value.message.length > 0, {
		message: "Write a message before switching the banner on.",
		path: ["message"],
	});

export type UpdateSystemNoticeRequest = z.infer<
	typeof updateSystemNoticeSchema
>;
