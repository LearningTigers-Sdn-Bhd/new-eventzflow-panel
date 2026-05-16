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
	status: emailDeliveryStatusSchema.optional(),
	recipient: z.string().optional(),
	subject: z.string().optional(),
	providerMessageId: z.string().optional(),
	stuckSent: z.boolean().optional(),
	page: z.number().int().positive().optional(),
	perPage: z.number().int().positive().max(100).optional(),
});

export type GetEmailDeliveriesRequest = z.infer<
	typeof getEmailDeliveriesSchema
>;

export const resendEmailDeliverySchema = z.object({
	id: z.number().int().positive(),
});

export type ResendEmailDeliveryRequest = z.infer<
	typeof resendEmailDeliverySchema
>;
