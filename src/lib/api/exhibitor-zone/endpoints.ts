import { kyClient, restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorZoneRequest,
	createExhibitorZoneSchema,
	type DeleteExhibitorZoneRequest,
	deleteExhibitorZoneSchema,
	type UpdateExhibitorZoneRequest,
	updateExhibitorZoneSchema,
} from "./request";
import type {
	BackendExhibitorZone,
	CreateExhibitorZoneResponse,
	DeleteExhibitorZoneResponse,
	ExhibitorZone,
	UpdateExhibitorZoneResponse,
} from "./response";

function transformZone(backend: BackendExhibitorZone): ExhibitorZone {
	return {
		id: backend.id,
		eventId: backend.event_id,
		zone: backend.zone,
		quota: backend.quota === null ? null : Number(backend.quota),
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getExhibitorZones(eventId: number): Promise<ExhibitorZone[]> {
	const response = await restClient.get<BackendExhibitorZone[]>(
		`v1/events/${eventId}/exhibitor_zones`,
	);

	return response.map(transformZone);
}

export async function createExhibitorZone(
	data: CreateExhibitorZoneRequest,
): Promise<CreateExhibitorZoneResponse> {
	const validated = createExhibitorZoneSchema.parse(data);

	const response = await restClient.post<BackendExhibitorZone>(
		`v1/events/${validated.event_id}/exhibitor_zones`,
		{
			exhibitor_zone: {
				zone: validated.zone,
				quota: validated.quota,
			},
		},
	);

	return {
		success: true,
		zone: transformZone(response),
	};
}

export async function updateExhibitorZone(
	data: UpdateExhibitorZoneRequest,
): Promise<UpdateExhibitorZoneResponse> {
	const validated = updateExhibitorZoneSchema.parse(data);

	const response = await restClient.patch<BackendExhibitorZone>(
		`v1/exhibitor_zones/${validated.id}`,
		{
			exhibitor_zone: {
				zone: validated.zone,
				quota: validated.quota,
			},
		},
	);

	return {
		success: true,
		zone: transformZone(response),
	};
}

export async function deleteExhibitorZone(
	data: DeleteExhibitorZoneRequest,
): Promise<DeleteExhibitorZoneResponse> {
	const validated = deleteExhibitorZoneSchema.parse(data);

	await kyClient.delete(`v1/exhibitor_zones/${validated.id}`);

	return { success: true };
}
