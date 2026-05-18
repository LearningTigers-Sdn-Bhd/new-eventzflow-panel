import { restClient } from "@/utils/rest-api";
import {
	type CreateVendorRequest,
	createVendorSchema,
	type DeleteVendorRequest,
	deleteVendorSchema,
	type ToggleVendorStatusRequest,
	toggleVendorStatusSchema,
	type UpdateVendorRequest,
	updateVendorSchema,
} from "./request";
import type {
	BackendVendor,
	CreateVendorResponse,
	DeleteVendorResponse,
	ToggleVendorStatusResponse,
	UpdateVendorResponse,
	Vendor,
} from "./response";

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
		vendorProfile: backendVendor.vendor_profile,
	};
}

/**
 * Get all vendors
 */
export async function getVendors(): Promise<Vendor[]> {
	try {
		const response = await restClient.get<BackendVendor[]>("v1/vendors");
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
		const hasImage = validated.vendor_profile_attributes?.image instanceof File;

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
				(payload.vendor as Record<string, unknown>).vendor_profile_attributes =
					rest;
			}
		}

		const response = await restClient.post<BackendVendor>(
			"v1/vendors",
			payload,
		);

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

		// Check if we need FormData (image upload or image removal)
		const hasImage = validated.vendor_profile_attributes?.image instanceof File;
		const hasRemoveImage =
			validated.vendor_profile_attributes?.remove_image === true;

		// Use FormData for file uploads OR image removal
		if (hasImage || hasRemoveImage) {
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
				const { image, remove_image, ...rest } =
					validated.vendor_profile_attributes;

				// Include profile id for updates (prevents destroy/recreate)
				if (rest.id) {
					formData.append(
						"vendor[vendor_profile_attributes][id]",
						String(rest.id),
					);
				}

				// Attach new image if provided
				if (image instanceof File) {
					formData.append("vendor[vendor_profile_attributes][image]", image);
				}

				// Flag for image removal (only when no new image is uploaded)
				if (remove_image && !(image instanceof File)) {
					formData.append(
						"vendor[vendor_profile_attributes][remove_image]",
						"true",
					);
				}

				Object.entries(rest).forEach(([key, value]) => {
					if (key !== "id" && value !== undefined && value !== null) {
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

		// JSON request for text-only updates (no image changes)
		const payload: Record<string, unknown> = {
			vendor: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
			},
		};

		// Only include password if provided
		if (validated.newPassword) {
			(payload.vendor as Record<string, unknown>).password =
				validated.newPassword;
			(payload.vendor as Record<string, unknown>).password_confirmation =
				validated.newPassword;
		}

		// Include vendor_profile_attributes if provided
		if (validated.vendor_profile_attributes) {
			const { image, remove_image, ...rest } =
				validated.vendor_profile_attributes;
			// Filter out undefined values but keep empty strings (to clear fields)
			// Keep id as number for Rails nested attributes
			const filteredRest: Record<string, string | number> = {};
			Object.entries(rest).forEach(([key, value]) => {
				if (value !== undefined) {
					filteredRest[key] =
						key === "id" ? (value as number) : (value as string);
				}
			});
			(payload.vendor as Record<string, unknown>).vendor_profile_attributes =
				filteredRest;
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
