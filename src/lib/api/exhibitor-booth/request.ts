import { z } from "zod";

export const exhibitorBoothStatusSchema = z.enum([
	"available",
	"reserved",
	"booked",
	"blocked",
]);

const boothNumberSchema = z.string().trim().min(1, "Booth number is required");

export const getExhibitorBoothsSchema = z.object({
	event_id: z.number().int().min(1, "Event ID is required"),
	status: exhibitorBoothStatusSchema.optional(),
	exhibitor_booth_price_id: z.number().int().min(1).optional(),
	exhibitor_zone_id: z.number().int().min(1).optional(),
});

export const createExhibitorBoothSchema = z.object({
	event_id: z.number().int().min(1, "Event ID is required"),
	exhibitor_booth_price_id: z.number().int().min(1, "Booth price is required"),
	number: boothNumberSchema,
	status: exhibitorBoothStatusSchema.default("available"),
});

export const bulkCreateExhibitorBoothsSchema = z.object({
	event_id: z.number().int().min(1, "Event ID is required"),
	exhibitor_booth_price_id: z.number().int().min(1, "Booth price is required"),
	numbers: z.array(boothNumberSchema).min(1, "Add at least one booth number"),
	status: exhibitorBoothStatusSchema.default("available"),
});

export const updateExhibitorBoothSchema = z.object({
	id: z.number().int().min(1, "Booth ID is required"),
	exhibitor_booth_price_id: z.number().int().min(1).optional(),
	number: boothNumberSchema.optional(),
	status: exhibitorBoothStatusSchema.optional(),
});

export const releaseExhibitorBoothSchema = z.object({
	id: z.number().int().min(1, "Booth ID is required"),
});

export const assignExhibitorBoothSchema = z.object({
	id: z.number().int().min(1, "Booth ID is required"),
	exhibitor_kit_id: z.number().int().min(1, "Exhibitor kit ID is required"),
});

export const deleteExhibitorBoothSchema = releaseExhibitorBoothSchema;

export type ExhibitorBoothStatus = z.infer<typeof exhibitorBoothStatusSchema>;
export type GetExhibitorBoothsRequest = z.infer<
	typeof getExhibitorBoothsSchema
>;
export type CreateExhibitorBoothRequest = z.infer<
	typeof createExhibitorBoothSchema
>;
export type BulkCreateExhibitorBoothsRequest = z.infer<
	typeof bulkCreateExhibitorBoothsSchema
>;
export type UpdateExhibitorBoothRequest = z.infer<
	typeof updateExhibitorBoothSchema
>;
export type ReleaseExhibitorBoothRequest = z.infer<
	typeof releaseExhibitorBoothSchema
>;
export type AssignExhibitorBoothRequest = z.infer<
	typeof assignExhibitorBoothSchema
>;
export type DeleteExhibitorBoothRequest = z.infer<
	typeof deleteExhibitorBoothSchema
>;
