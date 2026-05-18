import { publicRestClient, restClient } from "@/utils/rest-api";
import {
	type CreateVoucherRequest,
	createVoucherSchema,
	type DeleteVoucherRequest,
	deleteVoucherSchema,
	type UpdateVoucherRequest,
	updateVoucherSchema,
} from "./request";
import type {
	BackendVoucher,
	CreateVoucherResponse,
	DeleteVoucherResponse,
	UpdateVoucherResponse,
	Voucher,
} from "./response";

// Transform backend response to frontend format
function transformVoucher(backendVoucher: BackendVoucher): Voucher {
	return {
		id: backendVoucher.id,
		title: backendVoucher.title,
		voucherUuid: backendVoucher.voucher_uuid,
		description: backendVoucher.description,
		vendorId: backendVoucher.vendor_id,
		eventId: backendVoucher.event_id,
		voucherCode: backendVoucher.voucher_code,
		status: backendVoucher.status as "active" | "inactive",
		startDate: backendVoucher.start_date,
		endDate: backendVoucher.end_date,
		startTime: backendVoucher.start_time,
		endTime: backendVoucher.end_time,
		totalRedemptionAvailable: backendVoucher.total_redemption_available,
		isUnlimited: backendVoucher.is_unlimited ?? false,
		redeemedCount: backendVoucher.redeemed_count,
		maxRedemptionsPerUser: backendVoucher.max_redemptions_per_user,
		userRoleRestriction: backendVoucher.user_role_restriction,
		voucherType: backendVoucher.voucher_type as
			| "fixed_amount"
			| "percentage"
			| "free_item",
		voucherValue: Number.parseFloat(backendVoucher.voucher_value),
		voucherCategory: backendVoucher.voucher_category,
		imageUrl: backendVoucher.image_url,
		createdAt: backendVoucher.created_at,
		updatedAt: backendVoucher.updated_at,
		vendor: backendVoucher.vendor
			? {
					id: backendVoucher.vendor.id,
					fullName: backendVoucher.vendor.full_name,
					email: backendVoucher.vendor.email,
					phone: backendVoucher.vendor.phone,
				}
			: undefined,
	};
}

/**
 * Get all vouchers (optionally filtered by vendor_id or event_id)
 */
export async function getVouchers(params?: {
	vendor_id?: number;
	event_id?: number;
}): Promise<Voucher[]> {
	try {
		const queryParams = new URLSearchParams();
		if (params?.vendor_id) {
			queryParams.append("vendor_id", params.vendor_id.toString());
		}
		if (params?.event_id) {
			queryParams.append("event_id", params.event_id.toString());
		}

		const url = queryParams.toString()
			? `v1/vouchers?${queryParams.toString()}`
			: "v1/vouchers";

		const response = await restClient.get<
			BackendVoucher[] | { data: BackendVoucher[] }
		>(url);

		// Handle both direct array and wrapped response
		const vouchers = Array.isArray(response) ? response : response.data;

		// If no vouchers, return empty array (handles empty object {} or undefined)
		if (!vouchers || !Array.isArray(vouchers)) {
			return [];
		}

		return vouchers.map(transformVoucher);
	} catch (error: unknown) {
		console.error("Error fetching vouchers:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch vouchers";
		throw new Error(errorMessage);
	}
}

/**
 * Get a single voucher by ID
 */
export async function getVoucher(id: number | string): Promise<Voucher> {
	try {
		const response = await restClient.get<
			BackendVoucher | { data: BackendVoucher }
		>(`v1/vouchers/${id}`);

		// Handle both direct object and wrapped response
		const voucher = "data" in response ? response.data : response;

		return transformVoucher(voucher);
	} catch (error: unknown) {
		console.error("Error fetching voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch voucher";
		throw new Error(errorMessage);
	}
}

/**
 * Get a single voucher by UUID
 */
export async function getVoucherByUuid(uuid: string): Promise<Voucher> {
	try {
		// Get all vouchers and find by UUID
		// Note: Backend doesn't have a direct endpoint for voucher by UUID,
		// so we need to fetch and filter, or use the vouchers list endpoint
		const response = await restClient.get<
			BackendVoucher[] | { data: BackendVoucher[] }
		>("v1/vouchers");

		const vouchers = Array.isArray(response) ? response : response.data;

		if (!vouchers || !Array.isArray(vouchers)) {
			throw new Error("No vouchers found");
		}

		const voucher = vouchers.find((v) => v.voucher_uuid === uuid);

		if (!voucher) {
			throw new Error("Voucher not found");
		}

		return transformVoucher(voucher);
	} catch (error: unknown) {
		console.error("Error fetching voucher by UUID:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch voucher";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new voucher
 */
export async function createVoucher(
	data: CreateVoucherRequest,
): Promise<CreateVoucherResponse> {
	try {
		const validated = createVoucherSchema.parse(data);

		// If there's an image, use FormData
		if (validated.image) {
			const formData = new FormData();
			formData.append("vendor_id", validated.vendor_id.toString());
			formData.append("event_id", validated.event_id.toString());
			formData.append("title", validated.title);
			if (validated.description) {
				formData.append("description", validated.description);
			}
			if (validated.voucher_code) {
				formData.append("voucher_code", validated.voucher_code);
			}
			formData.append("status", validated.status);
			formData.append("start_date", validated.start_date);
			formData.append("end_date", validated.end_date);
			if (validated.start_time) {
				formData.append("start_time", validated.start_time);
			}
			if (validated.end_time) {
				formData.append("end_time", validated.end_time);
			}
			formData.append("is_unlimited", validated.is_unlimited.toString());
			if (!validated.is_unlimited && validated.total_redemption_available) {
				formData.append(
					"total_redemption_available",
					validated.total_redemption_available.toString(),
				);
			}
			formData.append(
				"max_redemptions_per_user",
				validated.max_redemptions_per_user.toString(),
			);
			formData.append("voucher_type", validated.voucher_type);
			formData.append("voucher_value", validated.voucher_value.toString());
			if (validated.voucher_category) {
				formData.append("voucher_category", validated.voucher_category);
			}
			formData.append("image", validated.image);

			const response = await restClient.postFormData<
				BackendVoucher | { data: BackendVoucher }
			>("v1/vouchers", formData);

			// Handle wrapped response
			const voucher = "data" in response ? response.data : response;

			return {
				success: true,
				voucher: transformVoucher(voucher),
			};
		}

		// Otherwise, use JSON
		const response = await restClient.post<
			BackendVoucher | { data: BackendVoucher }
		>("v1/vouchers", {
			vendor_id: validated.vendor_id,
			event_id: validated.event_id,
			title: validated.title,
			description: validated.description,
			voucher_code: validated.voucher_code,
			status: validated.status,
			start_date: validated.start_date,
			end_date: validated.end_date,
			start_time: validated.start_time,
			end_time: validated.end_time,
			is_unlimited: validated.is_unlimited,
			total_redemption_available: validated.is_unlimited
				? undefined
				: validated.total_redemption_available,
			max_redemptions_per_user: validated.max_redemptions_per_user,
			voucher_type: validated.voucher_type,
			voucher_value: validated.voucher_value,
			voucher_category: validated.voucher_category,
		});

		// Handle wrapped response
		const voucher = "data" in response ? response.data : response;

		return {
			success: true,
			voucher: transformVoucher(voucher),
		};
	} catch (error: unknown) {
		console.error("Error creating voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create voucher";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing voucher
 */
export async function updateVoucher(
	data: UpdateVoucherRequest,
): Promise<UpdateVoucherResponse> {
	try {
		const validated = updateVoucherSchema.parse(data);
		const { id, remove_image, ...updateData } = validated;

		// If there's an image or remove_image flag, use FormData with PATCH method
		if (validated.image || remove_image) {
			const formData = new FormData();
			Object.entries(updateData).forEach(([key, value]) => {
				if (value !== undefined && key !== "image") {
					// Handle is_unlimited: if true, send empty string to clear the value
					if (key === "total_redemption_available" && updateData.is_unlimited) {
						formData.append(key, "");
						return;
					}
					if (value !== null) {
						formData.append(key, value.toString());
					}
				}
			});
			if (validated.image) {
				formData.append("image", validated.image);
			}
			if (remove_image) {
				formData.append("remove_image", "true");
			}

			// Note: Using kyClientForFormData directly since restClient doesn't have patchFormData
			const { kyClientForFormData } = await import("@/utils/rest-api");
			const response = await kyClientForFormData
				.patch(`v1/vouchers/${id}`, { body: formData })
				.json<BackendVoucher | { data: BackendVoucher }>();

			// Handle wrapped response
			const voucher = "data" in response ? response.data : response;

			return {
				success: true,
				voucher: transformVoucher(voucher),
			};
		}

		// Otherwise, use JSON - handle is_unlimited logic
		const jsonData = { ...updateData };
		if (jsonData.is_unlimited) {
			// Explicitly send null to clear the value in the backend
			jsonData.total_redemption_available = null;
		}

		const response = await restClient.patch<
			BackendVoucher | { data: BackendVoucher }
		>(`v1/vouchers/${id}`, jsonData);

		// Handle wrapped response
		const voucher = "data" in response ? response.data : response;

		return {
			success: true,
			voucher: transformVoucher(voucher),
		};
	} catch (error: unknown) {
		console.error("Error updating voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update voucher";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a voucher
 */
export async function deleteVoucher(
	data: DeleteVoucherRequest,
): Promise<DeleteVoucherResponse> {
	try {
		const validated = deleteVoucherSchema.parse(data);

		// Note: Backend returns 204 No Content for delete, so no response body
		await restClient.delete(`v1/vouchers/${validated.id}`);

		return {
			success: true,
		};
	} catch (error: unknown) {
		console.error("Error deleting voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete voucher";
		throw new Error(errorMessage);
	}
}

// ============================================================================
// PUBLIC ENDPOINTS - No authentication required
// Use these for public-facing pages accessible without login
// ============================================================================

/**
 * Get all vouchers for an event (PUBLIC - no authentication required)
 * Use this for public voucher showcase pages
 */
export async function getPublicVouchers(params: {
	event_id: number;
}): Promise<Voucher[]> {
	try {
		const queryParams = new URLSearchParams();
		queryParams.append("event_id", params.event_id.toString());

		const url = `v1/public/vouchers?${queryParams.toString()}`;

		const response = await publicRestClient.get<
			BackendVoucher[] | { data: BackendVoucher[] }
		>(url);

		// Handle both direct array and wrapped response
		const vouchers = Array.isArray(response) ? response : response.data;

		// If no vouchers, return empty array
		if (!vouchers || !Array.isArray(vouchers)) {
			return [];
		}

		return vouchers.map(transformVoucher);
	} catch (error: unknown) {
		console.error("Error fetching public vouchers:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch vouchers";
		throw new Error(errorMessage);
	}
}

/**
 * Get a single voucher by ID (PUBLIC - no authentication required)
 * Use this for public voucher detail pages
 */
export async function getPublicVoucher(id: number | string): Promise<Voucher> {
	try {
		const response = await publicRestClient.get<
			BackendVoucher | { data: BackendVoucher }
		>(`v1/public/vouchers/${id}`);

		// Handle both direct object and wrapped response
		const voucher = "data" in response ? response.data : response;

		return transformVoucher(voucher);
	} catch (error: unknown) {
		console.error("Error fetching public voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch voucher";
		throw new Error(errorMessage);
	}
}
