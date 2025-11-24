import { restClient } from "@/utils/rest-api";
import type { VendorProfile } from "./response";
import {
	type UpdateVendorProfileRequest,
	updateVendorProfileSchema,
} from "./request";

/**
 * Get the full URL for a vendor image
 * @param filename - The image filename (e.g., "vendor-20231119_143022-a1b2c3d4.jpg")
 * @returns Full URL to access the image
 */
export function getVendorImageUrl(filename: string): string {
	return restClient.getImageUrl(`v1/vendor_images/${filename}`);
}

/**
 * Transform vendor profile image_path to full URL
 */
function transformVendorProfile(profile: VendorProfile): VendorProfile {
	let imagePath: string | null = null;
	if (profile.image_path) {
		// Extract filename from the path (e.g., "vendor_images/filename.jpg" -> "filename.jpg")
		const filename = profile.image_path.split('/').pop();
		if (filename) {
			imagePath = getVendorImageUrl(filename);
		}
	}

	return {
		...profile,
		image_path: imagePath,
	};
}

/**
 * Get vendor profile for the current authenticated vendor user
 */
export async function getVendorProfile(): Promise<VendorProfile> {
	const profile = await restClient.get<VendorProfile>("v1/vendor_profile");
	return transformVendorProfile(profile);
}

/**
 * Get vendor profile by vendor_id
 * Uses the endpoint: GET /v1/vendors/:vendor_id/profile
 */
export async function getVendorProfileById(vendorId: number): Promise<VendorProfile> {
	const profile = await restClient.get<VendorProfile>(`v1/vendors/${vendorId}/profile`);
	return transformVendorProfile(profile);
}

/**
 * Update vendor profile for the current authenticated vendor user
 */
export async function updateVendorProfile(
	data: UpdateVendorProfileRequest,
): Promise<VendorProfile> {
	const validated = updateVendorProfileSchema.parse(data);

	// If there's a File to upload, use FormData
	if (validated.image instanceof File) {
		const formData = new FormData();
		const { image, ...rest } = validated;

		formData.append("vendor_profile[image]", image);

		Object.entries(rest).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(`vendor_profile[${key}]`, value as string);
			}
		});

		const profile = await restClient.patchFormData<VendorProfile>("v1/vendor_profile", formData);
		return transformVendorProfile(profile);
	}

	// For JSON requests (no file upload)
	const { image, ...rest } = validated;
	
	// Build the payload, including image_path if it's explicitly set to empty string (for removal)
	const payload: Record<string, any> = {};
	Object.entries(rest).forEach(([key, value]) => {
		if (value !== undefined) {
			payload[key] = value;
		}
	});

	const profile = await restClient.patch<VendorProfile>("v1/vendor_profile", {
		vendor_profile: payload,
	});
	return transformVendorProfile(profile);
}
