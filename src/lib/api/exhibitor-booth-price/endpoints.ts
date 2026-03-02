import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorBoothPriceRequest,
	createExhibitorBoothPriceSchema,
	type DeleteExhibitorBoothPriceRequest,
	deleteExhibitorBoothPriceSchema,
	type UpdateExhibitorBoothPriceRequest,
	updateExhibitorBoothPriceSchema,
} from "./request";
import type {
	BackendExhibitorBoothPrice,
	CreateExhibitorBoothPriceResponse,
	DeleteExhibitorBoothPriceResponse,
	ExhibitorBoothPrice,
	UpdateExhibitorBoothPriceResponse,
} from "./response";

function transformBoothPrice(
	backend: BackendExhibitorBoothPrice,
): ExhibitorBoothPrice {
	return {
		id: backend.id,
		eventId: backend.event_id,
		boothType: backend.booth_type,
		exhibitorZoneId: backend.exhibitor_zone_id,
		zone: backend.zone,
		label: backend.label,
		price: Number(backend.price),
		quota: backend.quota,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorBoothPrices(
	eventId: number,
): Promise<ExhibitorBoothPrice[]> {
	const response = await restClient.get<BackendExhibitorBoothPrice[]>(
		`v1/events/${eventId}/exhibitor_booth_prices`,
	);

	return response.map(transformBoothPrice);
}

export async function createExhibitorBoothPrice(
	data: CreateExhibitorBoothPriceRequest,
): Promise<CreateExhibitorBoothPriceResponse> {
	const validated = createExhibitorBoothPriceSchema.parse(data);

	const response = await restClient.post<BackendExhibitorBoothPrice>(
		`v1/events/${validated.event_id}/exhibitor_booth_prices`,
		{
			exhibitor_booth_price: {
				booth_type: validated.booth_type,
				exhibitor_zone_id: validated.exhibitor_zone_id ?? null,
				label: validated.label,
				price: validated.price,
				quota: validated.quota ?? null,
			},
		},
	);

	return {
		success: true,
		boothPrice: transformBoothPrice(response),
	};
}

export async function updateExhibitorBoothPrice(
	data: UpdateExhibitorBoothPriceRequest,
): Promise<UpdateExhibitorBoothPriceResponse> {
	const validated = updateExhibitorBoothPriceSchema.parse(data);

	const response = await restClient.patch<BackendExhibitorBoothPrice>(
		`v1/exhibitor_booth_prices/${validated.id}`,
		{
			exhibitor_booth_price: {
				booth_type: validated.booth_type,
				exhibitor_zone_id: validated.exhibitor_zone_id ?? null,
				label: validated.label,
				price: validated.price,
				quota: validated.quota ?? null,
			},
		},
	);

	return {
		success: true,
		boothPrice: transformBoothPrice(response),
	};
}

export async function deleteExhibitorBoothPrice(
	data: DeleteExhibitorBoothPriceRequest,
): Promise<DeleteExhibitorBoothPriceResponse> {
	const validated = deleteExhibitorBoothPriceSchema.parse(data);

	await kyClient.delete(`v1/exhibitor_booth_prices/${validated.id}`);

	return { success: true };
}
