import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorBoothPriceTierRequest,
	createExhibitorBoothPriceTierSchema,
	type DeleteExhibitorBoothPriceTierRequest,
	deleteExhibitorBoothPriceTierSchema,
	type UpdateExhibitorBoothPriceTierRequest,
	updateExhibitorBoothPriceTierSchema,
} from "./request";
import type {
	BackendExhibitorBoothPriceTier,
	CreateExhibitorBoothPriceTierResponse,
	DeleteExhibitorBoothPriceTierResponse,
	ExhibitorBoothPriceTier,
	UpdateExhibitorBoothPriceTierResponse,
} from "./response";

function transformPriceTier(
	backend: BackendExhibitorBoothPriceTier,
): ExhibitorBoothPriceTier {
	return {
		id: backend.id,
		exhibitorBoothPriceId: backend.exhibitor_booth_price_id,
		price: Number(backend.price),
		startDate: backend.start_date,
		endDate: backend.end_date ?? undefined,
		label: backend.label,
		active: backend.active === true,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorBoothPriceTiers(
	exhibitorBoothPriceId: number,
): Promise<ExhibitorBoothPriceTier[]> {
	const response = await restClient.get<BackendExhibitorBoothPriceTier[]>(
		`v1/exhibitor_booth_prices/${exhibitorBoothPriceId}/price_tiers`,
	);

	return response.map(transformPriceTier);
}

export async function createExhibitorBoothPriceTier(
	data: CreateExhibitorBoothPriceTierRequest,
): Promise<CreateExhibitorBoothPriceTierResponse> {
	const validated = createExhibitorBoothPriceTierSchema.parse(data);

	const response = await restClient.post<BackendExhibitorBoothPriceTier>(
		`v1/exhibitor_booth_prices/${validated.exhibitor_booth_price_id}/price_tiers`,
		{
			exhibitor_booth_price_tier: {
				label: validated.label,
				price: validated.price,
				start_date: validated.start_date,
				end_date: validated.end_date,
			},
		},
	);

	return {
		success: true,
		priceTier: transformPriceTier(response),
	};
}

export async function updateExhibitorBoothPriceTier(
	data: UpdateExhibitorBoothPriceTierRequest,
): Promise<UpdateExhibitorBoothPriceTierResponse> {
	const validated = updateExhibitorBoothPriceTierSchema.parse(data);

	const response = await restClient.patch<BackendExhibitorBoothPriceTier>(
		`v1/exhibitor_booth_prices/${validated.exhibitor_booth_price_id}/price_tiers/${validated.id}`,
		{
			exhibitor_booth_price_tier: {
				label: validated.label,
				price: validated.price,
				start_date: validated.start_date,
				end_date: validated.end_date,
			},
		},
	);

	return {
		success: true,
		priceTier: transformPriceTier(response),
	};
}

export async function deleteExhibitorBoothPriceTier(
	data: DeleteExhibitorBoothPriceTierRequest,
): Promise<DeleteExhibitorBoothPriceTierResponse> {
	const validated = deleteExhibitorBoothPriceTierSchema.parse(data);

	await kyClient.delete(
		`v1/exhibitor_booth_prices/${validated.exhibitor_booth_price_id}/price_tiers/${validated.id}`,
	);

	return { success: true };
}
