import { z } from "zod";

export const paymentDetailSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	bank_name: z.string(),
	account_number: z.string(),
	account_name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type PaymentDetail = z.infer<typeof paymentDetailSchema>;

export const paymentDetailResponseSchema = paymentDetailSchema;

export type PaymentDetailResponse = PaymentDetail;
