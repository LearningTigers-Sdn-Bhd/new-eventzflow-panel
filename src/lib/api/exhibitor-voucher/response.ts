export type BackendExhibitorVoucher = {
	id: number;
	event_id: number;
	exhibitor_booth_price_id: number | null;
	exhibitor_package_id: number | null;
	code: string;
	discount_type: "percentage_off" | "fixed_amount_off" | "flat_price";
	discount_value: number | string;
	status: "active" | "redeemed";
	redeemed_by_exhibitor_kit_id: number | null;
	redeemed_at: string | null;
	booth_price_label?: string | null;
	package_name?: string | null;
	created_at: string;
	updated_at: string;
};

export type ExhibitorVoucher = {
	id: number;
	eventId: number;
	exhibitorBoothPriceId: number | null;
	exhibitorPackageId: number | null;
	code: string;
	discountType: "percentage_off" | "fixed_amount_off" | "flat_price";
	discountValue: number;
	status: "active" | "redeemed";
	redeemedByExhibitorKitId: number | null;
	redeemedAt: string | null;
	boothPriceLabel: string | null;
	packageName: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorVoucherResponse = {
	success: boolean;
	voucher: ExhibitorVoucher;
};

export type DeleteExhibitorVoucherResponse = {
	success: boolean;
};

export type BackendPreviewExhibitorVoucherResponse = {
	success: boolean;
	data: {
		price: number | string;
	};
};

export type PreviewExhibitorVoucherResponse = {
	success: boolean;
	price: number;
};
