import { z } from "zod";

export const createExhibitorBoothPriceTierSchema = z.object({
	exhibitor_booth_price_id: z
		.number()
		.min(1, "Exhibitor booth price ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

export const updateExhibitorBoothPriceTierSchema = z.object({
	exhibitor_booth_price_id: z
		.number()
		.min(1, "Exhibitor booth price ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

export const deleteExhibitorBoothPriceTierSchema = z.object({
	exhibitor_booth_price_id: z
		.number()
		.min(1, "Exhibitor booth price ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
});

export type CreateExhibitorBoothPriceTierRequest = z.infer<
	typeof createExhibitorBoothPriceTierSchema
>;
export type UpdateExhibitorBoothPriceTierRequest = z.infer<
	typeof updateExhibitorBoothPriceTierSchema
>;
export type DeleteExhibitorBoothPriceTierRequest = z.infer<
	typeof deleteExhibitorBoothPriceTierSchema
>;
