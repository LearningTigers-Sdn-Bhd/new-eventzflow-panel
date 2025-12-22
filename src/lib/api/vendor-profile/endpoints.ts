import { restClient } from "@/utils/rest-api";
import {
	type UpdateVendorProfileRequest,
	updateVendorProfileSchema,
} from "./request";
import type { VendorProfile } from "./response";

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
 * Handles both image upload (FormData) and JSON updates
 */
export async function updateVendorProfile(
	data: UpdateVendorProfileRequest,
): Promise<VendorProfile> {
	const validated = updateVendorProfileSchema.parse(data);
	const { image, remove_image, ...profileFields } = validated;

	// Use FormData for file uploads OR image removal
	// This ensures consistent handling of multipart requests
	if (image instanceof File || remove_image) {
		const formData = new FormData();

		// Attach new image if provided
		if (image instanceof File) {
			formData.append("image", image);
		}

		// Flag for image removal (only when no new image is uploaded)
		if (remove_image && !(image instanceof File)) {
			formData.append("remove_image", "true");
		}

		// Append profile fields
		Object.entries(profileFields).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(`vendor_profile[${key}]`, value as string);
			}
		});

		return restClient.patchFormData<VendorProfile>("v1/vendor_profile", formData);
	}

	// JSON request for text-only updates (no image changes)
	const payload: Record<string, unknown> = {};
	Object.entries(profileFields).forEach(([key, value]) => {
		if (value !== undefined) {
			payload[key] = value;
		}
	});

	return restClient.patch<VendorProfile>("v1/vendor_profile", {
		vendor_profile: payload,
	});
}
