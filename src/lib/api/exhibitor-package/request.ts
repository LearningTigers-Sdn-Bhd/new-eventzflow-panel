import { z } from "zod";

export const packagePayloadSchema = z.object({
	exhibitor_booth_price_id: z.number().int().min(1, "Booth price is required"),
	name: z.string().trim().min(1, "Name is required").max(255),
	inclusions: z.string().nullable().optional(),
	price: z.number().min(0, "Price must be 0 or greater"),
	quota: z
		.number()
		.int()
		.min(0, "Quota must be 0 or greater")
		.nullable()
		.optional(),
});

export const createExhibitorPackageSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	...packagePayloadSchema.shape,
});

export const updateExhibitorPackageSchema = z.object({
	id: z.number().min(1, "Package ID is required"),
	...packagePayloadSchema.shape,
});

export const deleteExhibitorPackageSchema = z.object({
	id: z.number().min(1, "Package ID is required"),
});

export type CreateExhibitorPackageRequest = z.infer<
	typeof createExhibitorPackageSchema
>;
export type UpdateExhibitorPackageRequest = z.infer<
	typeof updateExhibitorPackageSchema
>;
export type DeleteExhibitorPackageRequest = z.infer<
	typeof deleteExhibitorPackageSchema
>;
