import { restClient } from "@/utils/rest-api";
import type { BackendVendor, CreateVendorResponse, UpdateVendorResponse, ToggleVendorStatusResponse, DeleteVendorResponse, Vendor, VendorProfile } from "./response";
import { type CreateVendorRequest, createVendorSchema, type UpdateVendorRequest, updateVendorSchema, type ToggleVendorStatusRequest, toggleVendorStatusSchema, type DeleteVendorRequest, deleteVendorSchema } from "./request";

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
function transformVendorProfile(profile: VendorProfile | null): VendorProfile | null {
	if (!profile) return null;

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

// Transform backend response to frontend format
function transformVendor(backendVendor: BackendVendor): Vendor {
	return {
		id: backendVendor.id,
		full_name: backendVendor.full_name,
		email: backendVendor.email,
		phone: backendVendor.phone,
		role: backendVendor.role,
		status: backendVendor.status,
		createdAt: backendVendor.created_at,
		updatedAt: backendVendor.updated_at,
		vendorProfile: transformVendorProfile(backendVendor.vendor_profile),
	};
}

/**
 * Get all vendors
 */
export async function getVendors(): Promise<Vendor[]> {
	try {
		const response =
			await restClient.get<BackendVendor[]>("v1/vendors");
		return response.map(transformVendor);
	} catch (error: unknown) {
		console.error("Error fetching vendors:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch vendors";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new vendor user
 */
export async function createVendor(
	data: CreateVendorRequest,
): Promise<CreateVendorResponse> {
	try {
		const validated = createVendorSchema.parse(data);

		// Check if we have an image file to upload
		const hasImage =
			validated.vendor_profile_attributes?.image instanceof File;

		if (hasImage) {
			const formData = new FormData();
			formData.append("vendor[full_name]", validated.full_name);
			formData.append("vendor[email]", validated.email);
			formData.append("vendor[password]", validated.password);
			formData.append("vendor[password_confirmation]", validated.password);
			if (validated.phone) {
				formData.append("vendor[phone]", validated.phone);
			}

			if (validated.vendor_profile_attributes) {
				const { image, ...rest } = validated.vendor_profile_attributes;

				if (image instanceof File) {
					formData.append("vendor[vendor_profile_attributes][image]", image);
				}

				Object.entries(rest).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== "") {
						formData.append(
							`vendor[vendor_profile_attributes][${key}]`,
							value as string,
						);
					}
				});
			}

			const response = await restClient.postFormData<BackendVendor>(
				"v1/vendors",
				formData,
			);

			return {
				success: true,
				vendor: transformVendor(response),
			};
		}

		const payload: Record<string, unknown> = {
			vendor: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
				password: validated.password,
				password_confirmation: validated.password,
			},
		};

		// Include vendor_profile_attributes if provided (without image)
		if (validated.vendor_profile_attributes) {
			const { image, ...rest } = validated.vendor_profile_attributes;
			const hasProfileData = Object.values(rest).some(
				(v) => v !== undefined && v !== null && v !== "",
			);
			if (hasProfileData) {
				(payload.vendor as Record<string, unknown>).vendor_profile_attributes = rest;
			}
		}

		const response = await restClient.post<BackendVendor>("v1/vendors", payload);

		return {
			success: true,
			vendor: transformVendor(response),
		};
	} catch (error: unknown) {
		console.error("Error creating vendor:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create vendor";
		throw new Error(errorMessage);
	}
}


/**
 * Update an existing vendor
 */
export async function updateVendor(
	data: UpdateVendorRequest,
): Promise<UpdateVendorResponse> {
	try {
		const validated = updateVendorSchema.parse(data);

		// Check if we have an image file to upload
		const hasImage =
			validated.vendor_profile_attributes?.image instanceof File;

		if (hasImage) {
			const formData = new FormData();
			formData.append("vendor[full_name]", validated.full_name);
			formData.append("vendor[email]", validated.email);
			if (validated.phone) {
				formData.append("vendor[phone]", validated.phone);
			}

			if (validated.newPassword) {
				formData.append("vendor[password]", validated.newPassword);
				formData.append("vendor[password_confirmation]", validated.newPassword);
			}

			if (validated.vendor_profile_attributes) {
				const { image, ...rest } = validated.vendor_profile_attributes;
				
				if (image instanceof File) {
					formData.append("vendor[vendor_profile_attributes][image]", image);
				}

				Object.entries(rest).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						formData.append(
							`vendor[vendor_profile_attributes][${key}]`,
							value as string,
						);
					}
				});
			}

			const response = await restClient.patchFormData<BackendVendor>(
				`v1/vendors/${validated.id}`,
				formData,
			);

			return {
				success: true,
				vendor: transformVendor(response),
			};
		}

		const payload: Record<string, unknown> = {
			vendor: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
			},
		};

		// Only include password if provided
		if (validated.newPassword) {
			(payload.vendor as Record<string, unknown>).password = validated.newPassword;
			(payload.vendor as Record<string, unknown>).password_confirmation = validated.newPassword;
		}

		// Include vendor_profile_attributes if provided
		if (validated.vendor_profile_attributes) {
			// Remove image field if it's not a File (e.g. if it's undefined or null or a URL string which we don't send)
			const { image, ...rest } = validated.vendor_profile_attributes;
			// Filter out undefined values but keep empty strings (to clear fields)
			const filteredRest: Record<string, string> = {};
			Object.entries(rest).forEach(([key, value]) => {
				if (value !== undefined) {
					filteredRest[key] = value as string;
				}
			});
			(payload.vendor as Record<string, unknown>).vendor_profile_attributes = filteredRest;
		}

		const response = await restClient.patch<BackendVendor>(
			`v1/vendors/${validated.id}`,
			payload,
		);

		return {
			success: true,
			vendor: transformVendor(response),
		};
	} catch (error: unknown) {
		console.error("Error updating vendor:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update vendor";
		throw new Error(errorMessage);
	}
}

/**
 * Toggle vendor status (active/inactive)
 */
export async function toggleVendorStatus(
	data: ToggleVendorStatusRequest,
): Promise<ToggleVendorStatusResponse> {
	try {
		const validated = toggleVendorStatusSchema.parse(data);

		const response = await restClient.patch<BackendVendor>(
			`v1/vendors/${validated.id}/toggle_status`,
			{
				status: validated.status,
			},
		);

		return {
			success: true,
			vendor: transformVendor(response),
		};
	} catch (error: unknown) {
		console.error("Error toggling vendor status:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to toggle vendor status";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a vendor
 */
export async function deleteVendor(
	data: DeleteVendorRequest,
): Promise<DeleteVendorResponse> {
	try {
		const validated = deleteVendorSchema.parse(data);

		const response = await restClient.delete<BackendVendor>(
			`v1/vendors/${validated.id}`,
		);

		return {
			success: true,
			vendor: transformVendor(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting vendor:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete vendor";
		throw new Error(errorMessage);
	}
}
