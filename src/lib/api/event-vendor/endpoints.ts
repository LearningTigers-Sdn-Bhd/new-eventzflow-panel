import { restClient } from "@/utils/rest-api";
import {
	type CreateEventVendorBatchRequest,
	type CreateEventVendorRequest,
	createEventVendorBatchSchema,
	createEventVendorSchema,
	type UpdateEventVendorRequest,
	updateEventVendorSchema,
} from "./request";
import type { EventVendor } from "./response";

type EventVendorResponse = Omit<EventVendor, "exhibitor_kits"> & {
	exhibitor_kits?: EventVendor["exhibitor_kits"];
	exhibitor_kit?: EventVendor["exhibitor_kits"][number];
};

function normalizeEventVendor({
	exhibitor_kit,
	...vendor
}: EventVendorResponse): EventVendor {
	return {
		...vendor,
		exhibitor_kits:
			vendor.exhibitor_kits ?? (exhibitor_kit ? [exhibitor_kit] : []),
	};
}

/**
 * Get all vendors for an event
 */
export async function getEventVendors(eventId: number): Promise<EventVendor[]> {
	const vendors = await restClient.get<EventVendorResponse[]>(
		`v1/events/${eventId}/vendors`,
	);
	return vendors.map(normalizeEventVendor);
}

/**
 * Get a single event vendor by event_vendor id from the list
 * Note: There's no direct GET endpoint for a single event vendor,
 * so we fetch the list and find the matching one
 */
export async function getEventVendor(
	eventId: number,
	eventVendorId: number,
): Promise<EventVendor> {
	const vendors = await getEventVendors(eventId);
	const vendor = vendors.find((v) => v.id === eventVendorId);
	if (!vendor) {
		throw new Error(`Event vendor with id ${eventVendorId} not found`);
	}
	return vendor;
}

/**
 * Add a vendor to an event
 */
export async function createEventVendor(
	eventId: number,
	data: CreateEventVendorRequest,
): Promise<EventVendor> {
	const validated = createEventVendorSchema.parse(data);
	const vendor = await restClient.post<EventVendorResponse>(
		`v1/events/${eventId}/vendors`,
		{
			vendor: validated,
		},
	);
	return normalizeEventVendor(vendor);
}

/**
 * Add a vendor to an event with one or more booths in a single atomic batch.
 * Used by the organizer Manual Add form's multi-booth flow.
 */
export async function createEventVendorBatch(
	eventId: number,
	data: CreateEventVendorBatchRequest,
	idempotencyKey: string,
): Promise<EventVendor> {
	const validated = createEventVendorBatchSchema.parse(data);
	const vendor = await restClient.postWithHeaders<EventVendorResponse>(
		`v1/events/${eventId}/vendors/batch`,
		{ vendor: validated },
		{ "Idempotency-Key": idempotencyKey },
	);
	return normalizeEventVendor(vendor);
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
	const vendor = await restClient.patch<EventVendorResponse>(
		`v1/events/${eventId}/vendors/${vendorId}`,
		{
			vendor: validated,
		},
	);
	return normalizeEventVendor(vendor);
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
