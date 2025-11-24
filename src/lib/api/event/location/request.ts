import { z } from "zod";

// Location details schema (dynamic keys allowed)
export const locationDetailsSchema = z.record(z.string(), z.string().optional());

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
export const createLocationSchema = z
	.object({
		eventId: z.string().min(1, "Event ID is required"),
		name: z.string().min(1, "Name is required"),
		floor: z.string().nullable().optional(),
		isUnlimited: z.boolean().optional().default(false),
		scanLimit: z
			.number()
			.min(0, "Scan limit must be at least 0")
			.nullable()
			.optional(),
		memberIds: z.array(z.string()).optional(),
		locationDetails: locationDetailsSchema.optional(),
	})
	.refine((data) => data.isUnlimited || typeof data.scanLimit === "number", {
		message: "Scan limit is required when not unlimited",
		path: ["scanLimit"],
	});

// Validation schema for updating location info (name, floor, limits, details)
// Does NOT include memberIds - use updateLocationMembersSchema for that
export const updateLocationInfoSchema = z
	.object({
		eventId: z.string().min(1, "Event ID is required"),
		locationId: z.string().min(1, "Location ID is required"),
		name: z.string().min(1, "Name is required"),
		floor: z.string().nullable().optional(),
		isUnlimited: z.boolean().optional().default(false),
		scanLimit: z
			.number()
			.min(0, "Scan limit must be at least 0")
			.nullable()
			.optional(),
		locationDetails: locationDetailsSchema.optional(),
	})
	.refine((data) => data.isUnlimited || typeof data.scanLimit === "number", {
		message: "Scan limit is required when not unlimited",
		path: ["scanLimit"],
	});

// Validation schema for updating location members (staff/vendors)
export const updateLocationMembersSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	locationId: z.string().min(1, "Location ID is required"),
	name: z.string().min(1, "Name is required"),
	floor: z.string().nullable().optional(),
	isUnlimited: z.boolean().optional().default(false),
	scanLimit: z
		.number()
		.min(0, "Scan limit must be at least 0")
		.nullable()
		.optional(),
	memberIds: z.array(z.string()), // Required when updating members
	locationDetails: locationDetailsSchema.optional(),
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
export type UpdateLocationInfoRequest = z.infer<typeof updateLocationInfoSchema>;
export type UpdateLocationMembersRequest = z.infer<typeof updateLocationMembersSchema>;
export type DeleteLocationRequest = z.infer<typeof deleteLocationSchema>;

// Validation schema for assigning a member to a location
export const assignMemberToLocationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	locationId: z.string().min(1, "Location ID is required"),
	memberId: z.string().min(1, "Member ID is required"),
});

export type AssignMemberToLocationRequest = z.infer<
	typeof assignMemberToLocationSchema
>;
