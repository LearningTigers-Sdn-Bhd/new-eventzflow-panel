import { restClient } from "@/utils/rest-api";
import type { EventVendor } from "./response";
import {
	type CreateEventVendorRequest,
	createEventVendorSchema,
	type UpdateEventVendorRequest,
	updateEventVendorSchema,
} from "./request";

/**
 * Get all vendors for an event
 */
export async function getEventVendors(eventId: number): Promise<EventVendor[]> {
	return restClient.get<EventVendor[]>(`v1/events/${eventId}/vendors`);
}

/**
 * Add a vendor to an event
 */
export async function createEventVendor(
	eventId: number,
	data: CreateEventVendorRequest,
): Promise<EventVendor> {
	const validated = createEventVendorSchema.parse(data);
	return restClient.post<EventVendor>(`v1/events/${eventId}/vendors`, {
		vendor: validated,
	});
}

/**
 * Update a vendor in an event
 */
export async function updateEventVendor(
	eventId: number,
	vendorId: number,
	data: UpdateEventVendorRequest,
): Promise<EventVendor> {
	const validated = updateEventVendorSchema.parse(data);
	return restClient.patch<EventVendor>(
		`v1/events/${eventId}/vendors/${vendorId}`,
		{
			vendor: validated,
		},
	);
}

/**
 * Remove a vendor from an event
 */
export async function deleteEventVendor(
	eventId: number,
	vendorId: number,
): Promise<void> {
	await restClient.delete<void>(`v1/events/${eventId}/vendors/${vendorId}`);
}
