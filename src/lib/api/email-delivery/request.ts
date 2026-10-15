import { z } from "zod";

export const emailDeliveryStatusSchema = z.enum([
	"queued",
	"sending",
	"sent",
	"delivered",
	"failed",
	"bounced",
	"complained",
	"suppressed",
]);

export const getEmailDeliveriesSchema = z.object({
	eventId: z.number().int().positive().optional(),
	status: emailDeliveryStatusSchema.optional(),
	recipient: z.string().optional(),
	search: z.string().optional(),
	subject: z.string().optional(),
	providerMessageId: z.string().optional(),
	stuckSent: z.boolean().optional(),
	page: z.number().int().positive().optional(),
	perPage: z.number().int().positive().max(100).optional(),
});

export type GetEmailDeliveriesRequest = z.infer<
	typeof getEmailDeliveriesSchema
>;

// Mirrors EmailLogSetting on the backend (30 days to 10 years; proof-of-problem
// rows are never kept shorter than routine ones).
export const updateEmailLogSettingsSchema = z
	.object({
		retentionDays: z
			.number({ message: "Enter a number of days" })
			.int("Use whole days")
			.min(30, "Minimum is 30 days")
			.max(3650, "Maximum is 3650 days (10 years)"),
		protectedRetentionDays: z
			.number({ message: "Enter a number of days" })
			.int("Use whole days")
			.min(30, "Minimum is 30 days")
			.max(3650, "Maximum is 3650 days (10 years)"),
	})
	.refine((value) => value.protectedRetentionDays >= value.retentionDays, {
		path: ["protectedRetentionDays"],
		message: "Must be at least as long as the normal retention",
	});

export type UpdateEmailLogSettingsRequest = z.infer<
	typeof updateEmailLogSettingsSchema
>;

export const resendEmailDeliverySchema = z.object({
	id: z.number().int().positive(),
});

export type ResendEmailDeliveryRequest = z.infer<
	typeof resendEmailDeliverySchema
>;
