import { restClient } from "@/utils/rest-api";
import {
	type GetRedemptionLogsRequest,
	getRedemptionLogsSchema,
} from "./request";
import type { BackendRedemptionLog, RedemptionLog } from "./response";

/**
 * Transform backend voucher type to frontend format
 */
function transformVoucherType(
	backendType: string,
): "fixed_amount" | "percentage" | "free_item" {
	const typeMap: Record<string, "fixed_amount" | "percentage" | "free_item"> = {
		fixed_amount: "fixed_amount",
		percentage: "percentage",
		free_item: "free_item",
	};
	return typeMap[backendType] || "fixed_amount";
}

/**
 * Transform backend redeemer type to frontend format
 * Backend sends polymorphic type like "User", "Visitor" or "Ticket"
 * We normalize to "user_redeemer", "visitor_redeemer" or "ticket_redeemer"
 */
function transformRedeemerType(
	backendType: string,
): "user_redeemer" | "visitor_redeemer" | "ticket_redeemer" {
	// Handle both possible formats from backend
	const normalized = backendType.toLowerCase();
	if (normalized === "user" || normalized === "user_redeemer") {
		return "user_redeemer";
	}
	if (normalized === "ticket" || normalized === "ticket_redeemer") {
		return "ticket_redeemer";
	}
	return "visitor_redeemer";
}

/**
 * Transform backend redemption status to frontend format
 * Backend stores as capitalized string: "Completed" | "Cancelled"
 * We normalize to lowercase: "completed" | "cancelled"
 */
function transformRedemptionStatus(
	backendStatus: string,
): "completed" | "cancelled" {
	const normalized = backendStatus.toLowerCase();
	if (normalized === "completed") {
		return "completed";
	}
	return "cancelled";
}

/**
 * Transform backend redemption log to frontend format
 */
function transformRedemptionLog(
	backendLog: BackendRedemptionLog,
): RedemptionLog {
	return {
		id: backendLog.id,
		voucherId: backendLog.voucher_id,
		redeemerType: transformRedeemerType(backendLog.redeemer_type),
		redeemerId: backendLog.redeemer_id,
		redeemerStaffId: backendLog.redeemer_staff_id,
		redemptionTimestamp: backendLog.redemption_timestamp,
		redemptionLocation: backendLog.redemption_location,
		redemptionStatus: transformRedemptionStatus(backendLog.redemption_status),
		transactionGrossAmount: Number.parseFloat(
			backendLog.transaction_gross_amount,
		),
		discountAppliedValue: Number.parseFloat(backendLog.discount_applied_value),
		transactionNetAmount: Number.parseFloat(backendLog.transaction_net_amount),
		cancellationTimestamp: backendLog.cancellation_timestamp,
		cancellationReason: backendLog.cancellation_reason,
		notes: backendLog.notes,
		createdAt: backendLog.created_at,
		updatedAt: backendLog.updated_at,
		voucher: backendLog.voucher
			? {
					id: backendLog.voucher.id,
					title: backendLog.voucher.title,
					voucherUuid: backendLog.voucher.voucher_uuid,
					voucherCode: backendLog.voucher.voucher_code,
					voucherType: transformVoucherType(backendLog.voucher.voucher_type),
				}
			: undefined,
		redeemer: backendLog.redeemer
			? {
					id: backendLog.redeemer.id,
					fullName:
						backendLog.redeemer.full_name || backendLog.redeemer.attendee_name,
					email: backendLog.redeemer.email || backendLog.redeemer.attendee_email,
					phone: backendLog.redeemer.phone || backendLog.redeemer.attendee_phone,
					publicId: backendLog.redeemer.public_id,
				}
			: undefined,
		redeemerStaff: backendLog.redeemer_staff
			? {
					id: backendLog.redeemer_staff.id,
					fullName: backendLog.redeemer_staff.full_name,
					email: backendLog.redeemer_staff.email,
				}
			: undefined,
	};
}

/**
 * Get voucher redemption logs
 * GET /v1/events/:event_id/voucher_analytics/redemption_logs
 *
 * @param params - Required event_id, optional filters (vendor_id, voucher_id)
 * @returns Promise resolving to array of redemption logs
 * @throws Error if request fails
 */
export async function getRedemptionLogs(
	params: GetRedemptionLogsRequest,
): Promise<RedemptionLog[]> {
	try {
		// Validate request data
		const validated = getRedemptionLogsSchema.parse(params);

		// event_id is required
		if (!validated.event_id) {
			throw new Error("event_id is required");
		}

		// Build query string for optional filters
		const queryParams = new URLSearchParams();
		if (validated.vendor_id) {
			queryParams.append("vendor_id", validated.vendor_id.toString());
		}
		if (validated.voucher_id) {
			queryParams.append("voucher_id", validated.voucher_id.toString());
		}

		// Build URL
		const baseUrl = `v1/events/${validated.event_id}/voucher_analytics/redemption_logs`;
		const url = queryParams.toString()
			? `${baseUrl}?${queryParams.toString()}`
			: baseUrl;

		// Make API request
		const response = await restClient.get<
			BackendRedemptionLog[] | { data: BackendRedemptionLog[] }
		>(url);

		// Handle both direct array and wrapped response
		const logs = Array.isArray(response) ? response : response.data;

		// Transform to frontend format
		return logs.map(transformRedemptionLog);
	} catch (error: unknown) {
		console.error("Error fetching redemption logs:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch redemption logs";
		throw new Error(errorMessage);
	}
}
