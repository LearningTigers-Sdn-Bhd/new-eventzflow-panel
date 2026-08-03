import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorVoucherRequest,
	createExhibitorVoucherSchema,
	type DeleteExhibitorVoucherRequest,
	deleteExhibitorVoucherSchema,
	type PreviewExhibitorVoucherRequest,
	previewExhibitorVoucherSchema,
} from "./request";
import type {
	BackendExhibitorVoucher,
	BackendPreviewExhibitorVoucherResponse,
	CreateExhibitorVoucherResponse,
	DeleteExhibitorVoucherResponse,
	ExhibitorVoucher,
	PreviewExhibitorVoucherResponse,
} from "./response";

function transformVoucher(backend: BackendExhibitorVoucher): ExhibitorVoucher {
	return {
		id: backend.id,
		eventId: backend.event_id,
		exhibitorBoothPriceId: backend.exhibitor_booth_price_id,
		exhibitorPackageId: backend.exhibitor_package_id,
		code: backend.code,
		discountType: backend.discount_type,
		discountValue: Number(backend.discount_value),
		status: backend.status,
		redeemedByExhibitorKitId: backend.redeemed_by_exhibitor_kit_id,
		redeemedAt: backend.redeemed_at,
		boothPriceLabel: backend.booth_price_label ?? null,
		packageName: backend.package_name ?? null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorVouchers(
	eventId: number,
): Promise<ExhibitorVoucher[]> {
	const response = await restClient.get<BackendExhibitorVoucher[]>(
		`v1/events/${eventId}/exhibitor_vouchers`,
	);

	return response.map(transformVoucher);
}

export async function createExhibitorVoucher(
	data: CreateExhibitorVoucherRequest,
): Promise<CreateExhibitorVoucherResponse> {
	const validated = createExhibitorVoucherSchema.parse(data);

	const response = await restClient.post<BackendExhibitorVoucher>(
		`v1/events/${validated.event_id}/exhibitor_vouchers`,
		{
			exhibitor_voucher: {
				exhibitor_booth_price_id: validated.exhibitor_booth_price_id ?? null,
				exhibitor_package_id: validated.exhibitor_package_id ?? null,
				discount_type: validated.discount_type,
				discount_value: validated.discount_value,
			},
		},
	);

	return { success: true, voucher: transformVoucher(response) };
}

export async function deleteExhibitorVoucher(
	data: DeleteExhibitorVoucherRequest,
): Promise<DeleteExhibitorVoucherResponse> {
	const validated = deleteExhibitorVoucherSchema.parse(data);

	await kyClient.delete(`v1/exhibitor_vouchers/${validated.id}`);

	return { success: true };
}

export async function previewExhibitorVoucher(
	data: PreviewExhibitorVoucherRequest,
): Promise<PreviewExhibitorVoucherResponse> {
	const validated = previewExhibitorVoucherSchema.parse(data);

	const response =
		await restClient.post<BackendPreviewExhibitorVoucherResponse>(
			`v1/public/events/${validated.eventId}/exhibitor_vouchers/preview`,
			{
				voucher_code: validated.code,
				exhibitor_booth_price_id: validated.exhibitorBoothPriceId,
				exhibitor_package_id: validated.exhibitorPackageId ?? undefined,
			},
		);

	return { success: response.success, price: Number(response.data.price) };
}
