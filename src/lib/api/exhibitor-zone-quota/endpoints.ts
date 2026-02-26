import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorZoneQuotaRequest,
	createExhibitorZoneQuotaSchema,
	type DeleteExhibitorZoneQuotaRequest,
	deleteExhibitorZoneQuotaSchema,
	type UpdateExhibitorZoneQuotaRequest,
	updateExhibitorZoneQuotaSchema,
} from "./request";
import type {
	BackendExhibitorZoneQuota,
	CreateExhibitorZoneQuotaResponse,
	DeleteExhibitorZoneQuotaResponse,
	ExhibitorZoneQuota,
	UpdateExhibitorZoneQuotaResponse,
} from "./response";

function transformZoneQuota(
	backend: BackendExhibitorZoneQuota,
): ExhibitorZoneQuota {
	return {
		id: backend.id,
		eventId: backend.event_id,
		zone: backend.zone,
		quota: Number(backend.quota),
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorZoneQuotas(
	eventId: number,
): Promise<ExhibitorZoneQuota[]> {
	const response = await restClient.get<BackendExhibitorZoneQuota[]>(
		`v1/events/${eventId}/exhibitor_zone_quotas`,
	);

	return response.map(transformZoneQuota);
}

export async function createExhibitorZoneQuota(
	data: CreateExhibitorZoneQuotaRequest,
): Promise<CreateExhibitorZoneQuotaResponse> {
	const validated = createExhibitorZoneQuotaSchema.parse(data);

	const response = await restClient.post<BackendExhibitorZoneQuota>(
		`v1/events/${validated.event_id}/exhibitor_zone_quotas`,
		{
			exhibitor_zone_quota: {
				zone: validated.zone,
				quota: validated.quota,
			},
		},
	);

	return {
		success: true,
		zoneQuota: transformZoneQuota(response),
	};
}

export async function updateExhibitorZoneQuota(
	data: UpdateExhibitorZoneQuotaRequest,
): Promise<UpdateExhibitorZoneQuotaResponse> {
	const validated = updateExhibitorZoneQuotaSchema.parse(data);

	const response = await restClient.patch<BackendExhibitorZoneQuota>(
		`v1/exhibitor_zone_quotas/${validated.id}`,
		{
			exhibitor_zone_quota: {
				zone: validated.zone,
				quota: validated.quota,
			},
		},
	);

	return {
		success: true,
		zoneQuota: transformZoneQuota(response),
	};
}

export async function deleteExhibitorZoneQuota(
	data: DeleteExhibitorZoneQuotaRequest,
): Promise<DeleteExhibitorZoneQuotaResponse> {
	const validated = deleteExhibitorZoneQuotaSchema.parse(data);

	await kyClient.delete(`v1/exhibitor_zone_quotas/${validated.id}`);

	return { success: true };
}
