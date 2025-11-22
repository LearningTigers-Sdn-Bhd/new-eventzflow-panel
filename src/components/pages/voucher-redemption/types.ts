export type ScanStep = "voucher" | "visitor" | "review" | "amount";

export type VoucherDetails = {
	id: number;
	title: string;
	voucherType: "fixed_amount" | "percentage" | "free_item";
	voucherValue: number;
	description: string | null;
	totalRedemptionAvailable: number;
	redeemedCount: number;
	status: string;
};

export type VisitorDetails = {
	id: number;
	publicId: string;
	fullName: string;
	email: string;
	phone: string;
	eventId: number;
};

export type RedemptionState = {
	voucherUuid: string | null;
	visitorId: string | null;
	grossAmount: number | null;
	currentStep: ScanStep;
	voucherDetails: VoucherDetails | null;
	visitorDetails: VisitorDetails | null;
	isLoadingVoucher: boolean;
	isLoadingVisitor: boolean;
};

export type RedemptionResult = {
	success: boolean;
	message: string;
	netAmount?: number;
	discountApplied?: number;
	voucherType?: "fixed_amount" | "percentage" | "free_item";
	timestamp: string;
};
