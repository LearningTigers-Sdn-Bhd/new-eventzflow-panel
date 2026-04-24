import { z } from "zod";

export const passBundlePaymentModeSchema = z.enum(["free", "pay_offline"]);
export const passBundlePaymentStatusSchema = z.enum([
	"not_required",
	"unpaid",
	"paid",
	"sponsored",
]);
export const passBundleStatusSchema = z.enum(["active", "paused"]);

export const getEventPassBundlesSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

export const getPassBundleSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	passBundleId: z.number().int(),
});

export const createPassBundleSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	name: z.string().min(1, "Bundle Owner is required"),
	pass_limit: z.number().int().min(0),
	registration_form_id: z.number().int(),
	ticket_type_id: z.number().int(),
	payment_mode: passBundlePaymentModeSchema,
	payment_status: passBundlePaymentStatusSchema.optional(),
	status: passBundleStatusSchema,
	expires_at: z.string().nullable().optional(),
});

export const updatePassBundleSchema = createPassBundleSchema.partial().extend({
	eventId: z.string().min(1, "Event ID is required"),
	passBundleId: z.number().int(),
});

export const deletePassBundleSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	passBundleId: z.number().int(),
});

export type GetEventPassBundlesRequest = z.infer<
	typeof getEventPassBundlesSchema
>;
export type GetPassBundleRequest = z.infer<typeof getPassBundleSchema>;
export type CreatePassBundleRequest = z.infer<typeof createPassBundleSchema>;
export type UpdatePassBundleRequest = z.infer<typeof updatePassBundleSchema>;
export type DeletePassBundleRequest = z.infer<typeof deletePassBundleSchema>;
export type PassBundlePaymentMode = z.infer<typeof passBundlePaymentModeSchema>;
export type PassBundlePaymentStatus = z.infer<
	typeof passBundlePaymentStatusSchema
>;
export type PassBundleStatus = z.infer<typeof passBundleStatusSchema>;
