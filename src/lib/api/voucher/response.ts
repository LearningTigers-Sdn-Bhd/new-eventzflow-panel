// Backend API response types
export type BackendVoucher = {
	id: number;
	title: string;
	voucher_uuid: string;
	description: string | null;
	vendor_id: number;
	event_id: number;
	voucher_code: string;
	status: string; // Rails enum returns string: "active" | "inactive"
	start_date: string;
	end_date: string;
	start_time: string | null;
	end_time: string | null;
	total_redemption_available: number;
	redeemed_count: number;
	max_redemptions_per_user: number;
	user_role_restriction: string | null;
	voucher_type: string; // Rails enum returns string: "fixed_amount" | "percentage" | "free_item"
	voucher_value: string;
	voucher_category: string | null;
	image_path: string | null;
	created_at: string;
	updated_at: string;
	vendor?: {
		id: number;
		full_name: string;
		email: string;
		phone?: string;
	};
};

// Frontend voucher type
export type Voucher = {
	id: number;
	title: string;
	voucherUuid: string;
	description: string | null;
	vendorId: number;
	eventId: number;
	voucherCode: string;
	status: string;
	startDate: string;
	endDate: string;
	startTime: string | null;
	endTime: string | null;
	totalRedemptionAvailable: number;
	redeemedCount: number;
	maxRedemptionsPerUser: number;
	userRoleRestriction: string | null;
	voucherType: "fixed_amount" | "percentage" | "free_item";
	voucherValue: number;
	voucherCategory: string | null;
	imagePath: string | null;
	createdAt: string;
	updatedAt: string;
	vendor?: {
		id: number;
		fullName: string;
		email: string;
		phone?: string;
	};
};

// Response types for operations
export type CreateVoucherResponse = {
	success: boolean;
	voucher: Voucher;
};

export type UpdateVoucherResponse = {
	success: boolean;
	voucher: Voucher;
};

export type DeleteVoucherResponse = {
	success: boolean;
};

export type GetVouchersResponse = Voucher[];

