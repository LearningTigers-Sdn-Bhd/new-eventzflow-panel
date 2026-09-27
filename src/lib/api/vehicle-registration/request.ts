import { z } from "zod";

export const getEventVehicleRegistrationsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	issuesOnly: z.boolean().optional(),
	q: z.string().optional(),
	registrationFormId: z.number().int().optional(),
	archived: z.enum(["true", "all"]).optional(),
});

export const moveVehicleGroupSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	vehicleRegistrationId: z.number().int(),
	registrationFormId: z.number().int(),
});

export const syncVehicleBaseSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	vehicleRegistrationId: z.number().int(),
});

export const updateVehicleSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	vehicleRegistrationId: z.number().int(),
	plate: z.string().min(1, "Plate is required"),
});

export const vehicleIdSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	vehicleRegistrationId: z.number().int(),
});

export type GetEventVehicleRegistrationsRequest = z.infer<
	typeof getEventVehicleRegistrationsSchema
>;
export type MoveVehicleGroupRequest = z.infer<typeof moveVehicleGroupSchema>;
export type SyncVehicleBaseRequest = z.infer<typeof syncVehicleBaseSchema>;
export type UpdateVehicleRequest = z.infer<typeof updateVehicleSchema>;
export type VehicleIdRequest = z.infer<typeof vehicleIdSchema>;
