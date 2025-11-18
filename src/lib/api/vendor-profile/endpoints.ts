import { restClient } from "@/utils/rest-api";
import type { VendorProfile } from "./response";
import {
	type UpdateVendorProfileRequest,
	updateVendorProfileSchema,
} from "./request";

/**
 * Get vendor profile for the current authenticated vendor user
 */
export async function getVendorProfile(): Promise<VendorProfile> {
	return restClient.get<VendorProfile>("v1/vendor_profile");
}

/**
 * Get vendor profile by vendor_id
 * Uses the endpoint: GET /v1/vendors/:vendor_id/profile
 */
export async function getVendorProfileById(vendorId: number): Promise<VendorProfile> {
	return restClient.get<VendorProfile>(`v1/vendors/${vendorId}/profile`);
}

/**
 * Update vendor profile for the current authenticated vendor user
 */
export async function updateVendorProfile(
	data: UpdateVendorProfileRequest,
): Promise<VendorProfile> {
	const validated = updateVendorProfileSchema.parse(data);
	return restClient.patch<VendorProfile>("v1/vendor_profile", {
		vendor_profile: validated,
	});
}
