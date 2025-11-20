export type ScanStep = "voucher" | "visitor" | "amount";

export type RedemptionState = {
	voucherUuid: string | null;
	visitorId: string | null;
	grossAmount: number | null;
	currentStep: ScanStep;
};

export type RedemptionResult = {
	success: boolean;
	message: string;
	netAmount?: number;
	discountApplied?: number;
	voucherType?: "fixed_amount" | "percentage" | "free_item";
	timestamp: string;
};
