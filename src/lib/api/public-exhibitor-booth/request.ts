import { z } from "zod";

export const getPublicExhibitorBoothsSchema = z.object({
	event_slug: z.string().trim().min(1, "Event slug is required"),
	exhibitor_booth_price_id: z.number().int().min(1, "Booth price is required"),
});

export type GetPublicExhibitorBoothsRequest = z.infer<
	typeof getPublicExhibitorBoothsSchema
>;
