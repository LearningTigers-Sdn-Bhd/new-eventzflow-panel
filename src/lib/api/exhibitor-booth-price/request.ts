import { z } from "zod";

export const boothPricePayloadSchema = z.object({
	booth_type: z.string().trim().min(1, "Booth type is required"),
	exhibitor_zone_id: z.number().int().min(1).nullable().optional(),
	label: z.string().trim().min(1, "Label is required").max(255),
	price: z.number().min(0, "Price must be 0 or greater"),
	quota: z
		.number()
		.int()
		.min(0, "Quota must be 0 or greater")
		.nullable()
		.optional(),
});

export const createExhibitorBoothPriceSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	...boothPricePayloadSchema.shape,
});

export const updateExhibitorBoothPriceSchema = z.object({
	id: z.number().min(1, "Booth price ID is required"),
	...boothPricePayloadSchema.shape,
});

export const deleteExhibitorBoothPriceSchema = z.object({
	id: z.number().min(1, "Booth price ID is required"),
});

export type CreateExhibitorBoothPriceRequest = z.infer<
	typeof createExhibitorBoothPriceSchema
>;
export type UpdateExhibitorBoothPriceRequest = z.infer<
	typeof updateExhibitorBoothPriceSchema
>;
export type DeleteExhibitorBoothPriceRequest = z.infer<
	typeof deleteExhibitorBoothPriceSchema
>;
