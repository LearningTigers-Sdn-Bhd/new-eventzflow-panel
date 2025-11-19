import { restClient } from "@/utils/rest-api";
import type {
	BackendVoucher,
	CreateVoucherResponse,
	UpdateVoucherResponse,
	DeleteVoucherResponse,
	Voucher,
} from "./response";
import {
	type CreateVoucherRequest,
	createVoucherSchema,
	type UpdateVoucherRequest,
	updateVoucherSchema,
	type DeleteVoucherRequest,
	deleteVoucherSchema,
} from "./request";

/**
 * Get the full URL for a voucher image
 * @param filename - The image filename (e.g., "voucher-20231119_143022-a1b2c3d4.jpg")
 * @returns Full URL to access the image
 */
export function getVoucherImageUrl(filename: string): string {
	return restClient.getImageUrl(`v1/voucher_images/${filename}`);
}

// Transform backend response to frontend format
function transformVoucher(backendVoucher: BackendVoucher): Voucher {
	// Convert backend voucher_type to frontend format
	const voucherTypeMap = {
		FIXED_AMOUNT: "fixed_amount",
		PERCENTAGE: "percentage",
		FREE_ITEM: "free_item",
	} as const;

	// Transform image_path to full URL using the serve_image endpoint
	// Backend returns path like "voucher_images/voucher-20231119_143022-a1b2c3d4.jpg"
	// Extract filename and construct full URL
	let imagePath: string | null = null;
	
	if (backendVoucher.image_path) {
		// Extract filename from the path (e.g., "voucher_images/filename.jpg" -> "filename.jpg")
		const filename = backendVoucher.image_path.split('/').pop();
		if (filename) {
			imagePath = getVoucherImageUrl(filename);
		}
	}

	return {
		id: backendVoucher.id,
		title: backendVoucher.title,
		voucherUuid: backendVoucher.voucher_uuid,
		description: backendVoucher.description,
		vendorId: backendVoucher.vendor_id,
		eventId: backendVoucher.event_id,
		voucherCode: backendVoucher.voucher_code,
		status: backendVoucher.status,
		startDate: backendVoucher.start_date,
		endDate: backendVoucher.end_date,
		startTime: backendVoucher.start_time,
		endTime: backendVoucher.end_time,
		totalRedemptionAvailable: backendVoucher.total_redemption_available,
		redeemedCount: backendVoucher.redeemed_count,
		maxRedemptionsPerUser: backendVoucher.max_redemptions_per_user,
		userRoleRestriction: backendVoucher.user_role_restriction,
		voucherType:
			voucherTypeMap[backendVoucher.voucher_type] || "fixed_amount",
		voucherValue: Number.parseFloat(backendVoucher.voucher_value),
		imagePath,
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

		if (!Array.isArray(vouchers)) {
			console.error("Unexpected response format:", response);
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
			formData.append(
				"total_redemption_available",
				validated.total_redemption_available.toString(),
			);
			formData.append(
				"max_redemptions_per_user",
				validated.max_redemptions_per_user.toString(),
			);
			formData.append("voucher_type", validated.voucher_type);
			formData.append("voucher_value", validated.voucher_value.toString());
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
			total_redemption_available: validated.total_redemption_available,
			max_redemptions_per_user: validated.max_redemptions_per_user,
			voucher_type: validated.voucher_type,
			voucher_value: validated.voucher_value,
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
		const { id, ...updateData } = validated;

		// If there's an image, use FormData with PUT method (Rails expects PATCH/PUT for updates)
		if (validated.image) {
			const formData = new FormData();
			Object.entries(updateData).forEach(([key, value]) => {
				if (value !== undefined && key !== "image") {
					formData.append(key, value.toString());
				}
			});
			if (validated.image) {
				formData.append("image", validated.image);
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

		// Otherwise, use JSON
		const response = await restClient.patch<
			BackendVoucher | { data: BackendVoucher }
		>(`v1/vouchers/${id}`, updateData);

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

