import { restClient } from "@/utils/rest-api";
import {
	type AssignMemberToLocationRequest,
	assignMemberToLocationSchema,
	type CreateLocationRequest,
	createLocationSchema,
	type DeleteLocationRequest,
	deleteLocationSchema,
	type GetLocationByIdRequest,
	type GetLocationsRequest,
	getLocationByIdSchema,
	getLocationsSchema,
	type UpdateLocationInfoRequest,
	type UpdateLocationMembersRequest,
	updateLocationInfoSchema,
	updateLocationMembersSchema,
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
	const transformMember = (member: any) => ({
		id: member.id.toString(),
		name: member.full_name,
		email: member.email,
		role: member.role,
		memberType: member.member_type as "staff" | "vendor",
	});

	const staffMembers =
		backendLocation.staff_members?.map(transformMember) || [];
	const vendors = backendLocation.vendors?.map(transformMember) || [];
	const allMembers = [...staffMembers, ...vendors];

	return {
		id: backendLocation.id.toString(),
		name: backendLocation.name,
		scanLimit: backendLocation.scan_limit,
		isUnlimited: backendLocation.is_unlimited,
		floor: backendLocation.floor,
		locationDetails: backendLocation.location_details || {},
		locationDisplayName:
			backendLocation.location_display_name || backendLocation.name,
		staffMembers,
		vendors,
		assignedMembers: allMembers, // For backward compatibility
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
					floor: validated.floor,
					scan_limit: validated.isUnlimited ? 1 : validated.scanLimit,
					is_unlimited: validated.isUnlimited ?? false,
					member_ids: validated.memberIds || [],
					location_details: validated.locationDetails || {},
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
 * Update location info (name, floor, limits, details)
 * Does NOT update members - use updateLocationMembers for that
 */
export async function updateLocationInfo(
	data: UpdateLocationInfoRequest,
): Promise<UpdateLocationResponse> {
	try {
		const validated = updateLocationInfoSchema.parse(data);

		const location = await restClient.put<BackendLocation>(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}`,
			{
				event_location: {
					name: validated.name,
					floor: validated.floor,
					scan_limit: validated.isUnlimited ? 1 : validated.scanLimit,
					is_unlimited: validated.isUnlimited ?? false,
					location_details: validated.locationDetails || {},
					// Explicitly NOT including member_ids
				},
			},
		);
		return transformLocation(location);
	} catch (error: any) {
		console.error("Error updating location info:", error);
		throw new Error(error.message || "Failed to update location info");
	}
}

/**
 * Update location members (staff and vendors)
 * Used by assign members/vendors modals
 */
export async function updateLocationMembers(
	data: UpdateLocationMembersRequest,
): Promise<UpdateLocationResponse> {
	try {
		const validated = updateLocationMembersSchema.parse(data);

		const location = await restClient.put<BackendLocation>(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}`,
			{
				event_location: {
					name: validated.name,
					floor: validated.floor,
					scan_limit: validated.isUnlimited ? 1 : validated.scanLimit,
					is_unlimited: validated.isUnlimited ?? false,
					member_ids: validated.memberIds, // Explicitly updating members
					location_details: validated.locationDetails || {},
				},
			},
		);
		return transformLocation(location);
	} catch (error: any) {
		console.error("Error updating location members:", error);
		throw new Error(error.message || "Failed to update location members");
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

/**
 * Assign a member to a location
 */
export async function assignMemberToLocation(
	data: AssignMemberToLocationRequest,
): Promise<void> {
	try {
		const validated = assignMemberToLocationSchema.parse(data);

		await restClient.post(
			`v1/events/${validated.eventId}/event_locations/${validated.locationId}/assign_members`,
			{
				event_location: {
					member_ids: [validated.memberId],
				},
			},
		);
	} catch (error: any) {
		console.error("Error assigning member to location:", error);
		throw new Error(error.message || "Failed to assign member to location");
	}
}
