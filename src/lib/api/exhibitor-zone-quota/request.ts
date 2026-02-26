import { z } from "zod";

export const zoneQuotaPayloadSchema = z.object({
	zone: z.string().trim().min(1, "Zone is required").max(50),
	quota: z.number().int().min(0, "Zone quota must be 0 or greater"),
});

export const createExhibitorZoneQuotaSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	...zoneQuotaPayloadSchema.shape,
});

export const updateExhibitorZoneQuotaSchema = z.object({
	id: z.number().min(1, "Zone quota ID is required"),
	...zoneQuotaPayloadSchema.shape,
});

export const deleteExhibitorZoneQuotaSchema = z.object({
	id: z.number().min(1, "Zone quota ID is required"),
});

export type CreateExhibitorZoneQuotaRequest = z.infer<
	typeof createExhibitorZoneQuotaSchema
>;
export type UpdateExhibitorZoneQuotaRequest = z.infer<
	typeof updateExhibitorZoneQuotaSchema
>;
export type DeleteExhibitorZoneQuotaRequest = z.infer<
	typeof deleteExhibitorZoneQuotaSchema
>;
