import { restClient } from "@/utils/rest-api";
import type { BackendVendor, CreateVendorResponse, UpdateVendorResponse, ToggleVendorStatusResponse, Vendor } from "./response";
import { type CreateVendorRequest, createVendorSchema, type UpdateVendorRequest, updateVendorSchema, type ToggleVendorStatusRequest, toggleVendorStatusSchema } from "./request";

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

		const response = await restClient.post<BackendVendor>("v1/vendors", {
			vendor: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
				password: validated.password,
				password_confirmation: validated.password,
			},
		});

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

		const payload: any = {
			vendor: {
				full_name: validated.full_name,
				email: validated.email,
				phone: validated.phone,
			},
		};

		// Only include password if provided
		if (validated.newPassword) {
			payload.vendor.password = validated.newPassword;
			payload.vendor.password_confirmation = validated.newPassword;
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
