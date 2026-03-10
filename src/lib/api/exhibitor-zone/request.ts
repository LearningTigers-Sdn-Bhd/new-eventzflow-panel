import { z } from "zod";

export const zonePayloadSchema = z.object({
	zone: z.string().trim().min(1, "Zone is required").max(50),
	quota: z.number().int().min(0, "Zone quota must be 0 or greater").nullable(),
});

export const createExhibitorZoneSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	...zonePayloadSchema.shape,
});

export const updateExhibitorZoneSchema = z.object({
	id: z.number().min(1, "Zone ID is required"),
	...zonePayloadSchema.shape,
});

export const deleteExhibitorZoneSchema = z.object({
	id: z.number().min(1, "Zone ID is required"),
});

export type CreateExhibitorZoneRequest = z.infer<typeof createExhibitorZoneSchema>;
export type UpdateExhibitorZoneRequest = z.infer<typeof updateExhibitorZoneSchema>;
export type DeleteExhibitorZoneRequest = z.infer<typeof deleteExhibitorZoneSchema>;
