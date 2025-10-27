import { z } from "zod";

// Validation schema for getting locations
export const getLocationsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for getting a single location
export const getLocationByIdSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	locationId: z.string().min(1, "Location ID is required"),
});

// Validation schema for creating a location
export const createLocationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	name: z.string().min(1, "Name is required"),
	scanLimit: z.number().min(0, "Scan limit must be at least 0"),
	memberIds: z.array(z.string()).optional(),
});

// Validation schema for updating a location
export const updateLocationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	locationId: z.string().min(1, "Location ID is required"),
	name: z.string().min(1, "Name is required"),
	scanLimit: z.number().min(0, "Scan limit must be at least 0"),
	memberIds: z.array(z.string()).optional(),
});

// Validation schema for deleting a location
export const deleteLocationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	locationId: z.string().min(1, "Location ID is required"),
});

// Type exports for request data
export type GetLocationsRequest = z.infer<typeof getLocationsSchema>;
export type GetLocationByIdRequest = z.infer<typeof getLocationByIdSchema>;
export type CreateLocationRequest = z.infer<typeof createLocationSchema>;
export type UpdateLocationRequest = z.infer<typeof updateLocationSchema>;
export type DeleteLocationRequest = z.infer<typeof deleteLocationSchema>;
