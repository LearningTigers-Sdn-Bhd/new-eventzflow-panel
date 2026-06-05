import { z } from "zod";

export const submitWishSchema = z.object({
	guest_name: z.string().trim().min(1, "Name is required").max(100),
	message: z.string().trim().min(1, "Message is required").max(300),
	visitor_public_id: z.string().optional(),
});

export type SubmitWishRequest = z.infer<typeof submitWishSchema>;
