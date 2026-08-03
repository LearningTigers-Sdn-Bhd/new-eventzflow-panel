import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorPackageRequest,
	createExhibitorPackageSchema,
	type DeleteExhibitorPackageRequest,
	deleteExhibitorPackageSchema,
	type UpdateExhibitorPackageRequest,
	updateExhibitorPackageSchema,
} from "./request";
import type {
	BackendExhibitorPackage,
	CreateExhibitorPackageResponse,
	DeleteExhibitorPackageResponse,
	ExhibitorPackage,
	UpdateExhibitorPackageResponse,
} from "./response";

function transformPackage(backend: BackendExhibitorPackage): ExhibitorPackage {
	return {
		id: backend.id,
		eventId: backend.event_id,
		exhibitorBoothPriceId: backend.exhibitor_booth_price_id,
		name: backend.name,
		inclusions: backend.inclusions ?? null,
		price: Number(backend.price),
		quota: backend.quota,
		boothPriceLabel: backend.booth_price_label ?? null,
		boothPriceZone: backend.booth_price_zone ?? null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorPackages(
	eventId: number,
): Promise<ExhibitorPackage[]> {
	const response = await restClient.get<BackendExhibitorPackage[]>(
		`v1/events/${eventId}/exhibitor_packages`,
	);

	return response.map(transformPackage);
}

export async function createExhibitorPackage(
	data: CreateExhibitorPackageRequest,
): Promise<CreateExhibitorPackageResponse> {
	const validated = createExhibitorPackageSchema.parse(data);

	const response = await restClient.post<BackendExhibitorPackage>(
		`v1/events/${validated.event_id}/exhibitor_packages`,
		{
			exhibitor_package: {
				exhibitor_booth_price_id: validated.exhibitor_booth_price_id,
				name: validated.name,
				inclusions: validated.inclusions ?? null,
				price: validated.price,
				quota: validated.quota ?? null,
			},
		},
	);

	return { success: true, exhibitorPackage: transformPackage(response) };
}

export async function updateExhibitorPackage(
	data: UpdateExhibitorPackageRequest,
): Promise<UpdateExhibitorPackageResponse> {
	const validated = updateExhibitorPackageSchema.parse(data);

	const response = await restClient.patch<BackendExhibitorPackage>(
		`v1/exhibitor_packages/${validated.id}`,
		{
			exhibitor_package: {
				exhibitor_booth_price_id: validated.exhibitor_booth_price_id,
				name: validated.name,
				inclusions: validated.inclusions ?? null,
				price: validated.price,
				quota: validated.quota ?? null,
			},
		},
	);

	return { success: true, exhibitorPackage: transformPackage(response) };
}

export async function deleteExhibitorPackage(
	data: DeleteExhibitorPackageRequest,
): Promise<DeleteExhibitorPackageResponse> {
	const validated = deleteExhibitorPackageSchema.parse(data);

	await kyClient.delete(`v1/exhibitor_packages/${validated.id}`);

	return { success: true };
}
