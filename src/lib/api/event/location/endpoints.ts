import { restClient } from "@/utils/rest-api";
import {
	type CreateLocationRequest,
	createLocationSchema,
	type DeleteLocationRequest,
	deleteLocationSchema,
	type GetLocationByIdRequest,
	type GetLocationsRequest,
	getLocationByIdSchema,
	getLocationsSchema,
	type UpdateLocationRequest,
	updateLocationSchema,
} from "./request";
import type {
	BackendLocation,
	CreateLocationResponse,
	DeleteLocationResponse,
	Location,
	UpdateLocationResponse,
} from "./response";

// Transform backend response to frontend format
function transformLocation(backendLocation: BackendLocation): Location {
	return {
		id: backendLocation.id.toString(),
		name: backendLocation.name,
		scanLimit: backendLocation.scan_limit,
		isUnlimited: backendLocation.is_unlimited,
		assignedMembers: backendLocation.members.map((member) => ({
			id: member.id.toString(),
			name: member.full_name,
			email: member.email,
		})),
	};
}

/**
 * Get all locations for an event
 */
export async function getLocations(
	data: GetLocationsRequest,
): Promise<Location[]> {
	try {
		const validated = getLocationsSchema.parse(data);

		const locations = await restClient.get<BackendLocation[]>(
			`v1/events/${validated.eventId}/event_locations`,
		);
		return locations.map(transformLocation);
	} catch (error: any) {
		console.error("Error fetching locations:", error);
		throw new Error(error.message || "Failed to fetch locations");
	}
}

/**
 * Get a single location by ID
 */
export async function getLocationById(
	data: GetLocationByIdRequest,
): Promise<Location> {
	try {
		const validated = getLocationByIdSchema.parse(data);

		const location = await restClient.get<BackendLocation>(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}`,
		);
		return transformLocation(location);
	} catch (error: any) {
		console.error("Error fetching location:", error);
		throw new Error(error.message || "Failed to fetch location");
	}
}

/**
 * Create a new location
 */
export async function createLocation(
	data: CreateLocationRequest,
): Promise<CreateLocationResponse> {
	try {
		const validated = createLocationSchema.parse(data);

		const location = await restClient.post<BackendLocation>(
			`v1/events/${validated.eventId}/event_locations`,
			{
				event_location: {
					name: validated.name,
					scan_limit: validated.isUnlimited ? 1 : validated.scanLimit,
					is_unlimited: validated.isUnlimited ?? false,
					member_ids: validated.memberIds || [],
				},
			},
		);
		return transformLocation(location);
	} catch (error: any) {
		console.error("Error creating location:", error);
		throw new Error(error.message || "Failed to create location");
	}
}

/**
 * Update an existing location
 */
export async function updateLocation(
	data: UpdateLocationRequest,
): Promise<UpdateLocationResponse> {
	try {
		const validated = updateLocationSchema.parse(data);

		const location = await restClient.put<BackendLocation>(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}`,
			{
				event_location: {
					name: validated.name,
					scan_limit: validated.isUnlimited ? 1 : validated.scanLimit,
					is_unlimited: validated.isUnlimited ?? false,
					member_ids: validated.memberIds || [],
				},
			},
		);
		return transformLocation(location);
	} catch (error: any) {
		console.error("Error updating location:", error);
		throw new Error(error.message || "Failed to update location");
	}
}

/**
 * Delete a location
 */
export async function deleteLocation(
	data: DeleteLocationRequest,
): Promise<DeleteLocationResponse> {
	try {
		const validated = deleteLocationSchema.parse(data);

		await restClient.delete(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}`,
		);
		return { success: true };
	} catch (error: any) {
		console.error("Error deleting location:", error);
		throw new Error(error.message || "Failed to delete location");
	}
}
