import { z } from "zod";

export const createPaymentGatewaySchema = z.object({
	provider: z.string().default("razorpay"),
	key_id: z.string().min(1, "Key ID is required"),
	key_secret: z.string().min(1, "Key Secret is required"),
	webhook_secret: z.string().optional(),
});

export type CreatePaymentGatewayRequest = z.infer<
	typeof createPaymentGatewaySchema
>;

export const updatePaymentGatewaySchema = z.object({
	provider: z.string().optional(),
	key_id: z.string().min(1, "Key ID is required").optional(),
	key_secret: z.string().optional(),
	webhook_secret: z.string().optional(),
});

export type UpdatePaymentGatewayRequest = z.infer<
	typeof updatePaymentGatewaySchema
>;
