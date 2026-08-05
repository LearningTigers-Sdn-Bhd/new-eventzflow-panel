import type { CreateEventVendorBatchBooth } from "@/lib/api/event-vendor";

export interface ManualBoothRow {
	id: string;
	boothPriceId: string;
	boothType: string;
	packageId: string;
	boothNumber: string;
	voucherCode: string;
}

export function createManualBoothRow(id: string): ManualBoothRow {
	return {
		id,
		boothPriceId: "",
		boothType: "",
		packageId: "",
		boothNumber: "",
		voucherCode: "",
	};
}

export function normalizeBoothNumber(value: string): string {
	return value.trim().toUpperCase();
}

export function hasDuplicateBoothNumbers(rows: ManualBoothRow[]): boolean {
	const seen = new Set<string>();
	for (const row of rows) {
		const normalized = normalizeBoothNumber(row.boothNumber);
		if (!normalized) continue;
		if (seen.has(normalized)) return true;
		seen.add(normalized);
	}
	return false;
}

export function toBatchBooths(
	rows: ManualBoothRow[],
	hasBoothPrices: boolean,
): CreateEventVendorBatchBooth[] {
	return rows.map((row) => {
		const booth: CreateEventVendorBatchBooth = {};

		if (hasBoothPrices && row.boothPriceId) {
			booth.exhibitor_booth_price_id = Number(row.boothPriceId);
		} else if (row.boothType.trim()) {
			booth.booth_type = row.boothType.trim();
		}

		if (row.packageId) {
			booth.exhibitor_package_id = Number(row.packageId);
		}

		const boothNumber = row.boothNumber.trim();
		if (boothNumber) booth.booth_number = boothNumber;

		const voucherCode = row.voucherCode.trim();
		if (voucherCode) booth.voucher_code = voucherCode;

		return booth;
	});
}
