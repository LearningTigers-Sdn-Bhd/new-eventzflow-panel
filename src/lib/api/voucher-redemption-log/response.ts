/**
 * Backend API response types for voucher redemption logs
 */

/**
 * Backend response from GET /v1/events/:event_id/voucher_analytics/redemption_logs
 */
export type BackendRedemptionLog = {
	id: number;
	voucher_id: number;
	redeemer_type: string; // Polymorphic type: "User" | "Visitor"
	redeemer_id: number;
	redeemer_staff_id: number | null;
	redemption_timestamp: string;
	redemption_location: string | null;
	redemption_status: string; // Database stores as string: "Completed" | "Cancelled" (capitalized)
	transaction_gross_amount: string; // Decimal as string
	discount_applied_value: string; // Decimal as string
	transaction_net_amount: string; // Decimal as string
	cancellation_timestamp: string | null;
	cancellation_reason: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	// Associations
	voucher?: {
		id: number;
		title: string;
		voucher_uuid: string;
		voucher_code: string;
		voucher_type: string;
	};
	redeemer?: {
		id: number;
		full_name?: string;
		email?: string;
		phone?: string;
		public_id?: string; // For visitors
	};
	redeemer_staff?: {
		id: number;
		full_name: string;
		email: string;
	};
};

/**
 * Frontend voucher redemption log type (camelCase)
 */
export type RedemptionLog = {
	id: number;
	voucherId: number;
	redeemerType: "user_redeemer" | "visitor_redeemer"; // Match backend polymorphic type
	redeemerId: number;
	redeemerStaffId: number | null;
	redemptionTimestamp: string;
	redemptionLocation: string | null;
	redemptionStatus: "completed" | "cancelled"; // Match backend enum values
	transactionGrossAmount: number;
	discountAppliedValue: number;
	transactionNetAmount: number;
	cancellationTimestamp: string | null;
	cancellationReason: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	// Associations
	voucher?: {
		id: number;
		title: string;
		voucherUuid: string;
		voucherCode: string;
		voucherType: "fixed_amount" | "percentage" | "free_item";
	};
	redeemer?: {
		id: number;
		fullName?: string;
		email?: string;
		phone?: string;
		publicId?: string; // For visitors
	};
	redeemerStaff?: {
		id: number;
		fullName: string;
		email: string;
	};
};
