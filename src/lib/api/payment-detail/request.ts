import { z } from "zod";

export const createPaymentDetailRequestSchema = z.object({
	payment_detail: z.object({
		bank_name: z.string().min(1, "Bank name is required"),
		account_number: z.string().min(1, "Account number is required"),
		account_name: z.string().min(1, "Account name is required"),
	}),
});

export type CreatePaymentDetailRequest = z.infer<
	typeof createPaymentDetailRequestSchema
>;

export const updatePaymentDetailRequestSchema = z.object({
	payment_detail: z.object({
		bank_name: z.string().min(1, "Bank name is required").optional(),
		account_number: z.string().min(1, "Account number is required").optional(),
		account_name: z.string().min(1, "Account name is required").optional(),
	}),
});

export type UpdatePaymentDetailRequest = z.infer<
	typeof updatePaymentDetailRequestSchema
>;
