import { restClient } from "@/utils/rest-api";
import type { VendorProfile } from "./response";
import {
	type UpdateVendorProfileRequest,
	updateVendorProfileSchema,
} from "./request";

/**
 * Get vendor profile
 */
export async function getVendorProfile(
	eventId: number,
	vendorId: number,
): Promise<VendorProfile> {
	return restClient.get<VendorProfile>(
		`v1/events/${eventId}/vendors/${vendorId}/profile`,
	);
}

/**
 * Update vendor profile
 */
export async function updateVendorProfile(
	eventId: number,
	vendorId: number,
	data: UpdateVendorProfileRequest,
): Promise<VendorProfile> {
	const validated = updateVendorProfileSchema.parse(data);
	return restClient.patch<VendorProfile>(
		`v1/events/${eventId}/vendors/${vendorId}/profile`,
		{ vendor_profile: validated },
	);
}
