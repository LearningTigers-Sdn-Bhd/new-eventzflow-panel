import { kyClient, restClient } from "@/utils/rest-api";
import {
	type AssignExhibitorBoothRequest,
	assignExhibitorBoothSchema,
	type BulkCreateExhibitorBoothsRequest,
	bulkCreateExhibitorBoothsSchema,
	type CreateExhibitorBoothRequest,
	createExhibitorBoothSchema,
	type DeleteExhibitorBoothRequest,
	deleteExhibitorBoothSchema,
	type GetExhibitorBoothsRequest,
	getExhibitorBoothsSchema,
	type ReleaseExhibitorBoothRequest,
	releaseExhibitorBoothSchema,
	type UpdateExhibitorBoothRequest,
	updateExhibitorBoothSchema,
} from "./request";
import type {
	AssignExhibitorBoothResponse,
	BackendExhibitorBooth,
	BulkCreateExhibitorBoothsResponse,
	CreateExhibitorBoothResponse,
	DeleteExhibitorBoothResponse,
	ExhibitorBooth,
	ReleaseExhibitorBoothResponse,
	UpdateExhibitorBoothResponse,
} from "./response";

function transformBooth(backend: BackendExhibitorBooth): ExhibitorBooth {
	return {
		id: backend.id,
		number: backend.number,
		status: backend.status,
		exhibitorBoothPriceId: backend.exhibitor_booth_price_id,
		boothType: backend.booth_type,
		zone: backend.zone,
		label: backend.label,
		heldBy: backend.held_by,
		heldSince: backend.held_since,
	};
}

export async function getExhibitorBooths(
	data: GetExhibitorBoothsRequest,
): Promise<ExhibitorBooth[]> {
	const validated = getExhibitorBoothsSchema.parse(data);
	const params = new URLSearchParams();
	if (validated.status) params.set("status", validated.status);
	if (validated.exhibitor_booth_price_id) {
		params.set(
			"exhibitor_booth_price_id",
			String(validated.exhibitor_booth_price_id),
		);
	}
	if (validated.exhibitor_zone_id) {
		params.set("exhibitor_zone_id", String(validated.exhibitor_zone_id));
	}
	const query = params.toString();
	const response = await restClient.get<BackendExhibitorBooth[]>(
		`v1/events/${validated.event_id}/exhibitor_booths${query ? `?${query}` : ""}`,
	);

	return response.map(transformBooth);
}

export async function createExhibitorBooth(
	data: CreateExhibitorBoothRequest,
): Promise<CreateExhibitorBoothResponse> {
	const validated = createExhibitorBoothSchema.parse(data);
	const response = await restClient.post<BackendExhibitorBooth>(
		`v1/events/${validated.event_id}/exhibitor_booths`,
		{
			exhibitor_booth: {
				exhibitor_booth_price_id: validated.exhibitor_booth_price_id,
				number: validated.number,
				status: validated.status,
			},
		},
	);

	return { success: true, booth: transformBooth(response) };
}

export async function bulkCreateExhibitorBooths(
	data: BulkCreateExhibitorBoothsRequest,
): Promise<BulkCreateExhibitorBoothsResponse> {
	const validated = bulkCreateExhibitorBoothsSchema.parse(data);
	const response = await restClient.post<BackendExhibitorBooth[]>(
		`v1/events/${validated.event_id}/exhibitor_booths/bulk`,
		{
			exhibitor_booths: {
				exhibitor_booth_price_id: validated.exhibitor_booth_price_id,
				numbers: validated.numbers,
				status: validated.status,
			},
		},
	);

	return { success: true, booths: response.map(transformBooth) };
}

export async function updateExhibitorBooth(
	data: UpdateExhibitorBoothRequest,
): Promise<UpdateExhibitorBoothResponse> {
	const validated = updateExhibitorBoothSchema.parse(data);
	const response = await restClient.patch<BackendExhibitorBooth>(
		`v1/exhibitor_booths/${validated.id}`,
		{
			exhibitor_booth: {
				...(validated.exhibitor_booth_price_id
					? {
							exhibitor_booth_price_id: validated.exhibitor_booth_price_id,
						}
					: {}),
				...(validated.number ? { number: validated.number } : {}),
				...(validated.status ? { status: validated.status } : {}),
			},
		},
	);

	return { success: true, booth: transformBooth(response) };
}

export async function releaseExhibitorBooth(
	data: ReleaseExhibitorBoothRequest,
): Promise<ReleaseExhibitorBoothResponse> {
	const validated = releaseExhibitorBoothSchema.parse(data);
	const response = await restClient.post<BackendExhibitorBooth>(
		`v1/exhibitor_booths/${validated.id}/release`,
	);

	return { success: true, booth: transformBooth(response) };
}

export async function assignExhibitorBooth(
	data: AssignExhibitorBoothRequest,
): Promise<AssignExhibitorBoothResponse> {
	const validated = assignExhibitorBoothSchema.parse(data);
	const response = await restClient.post<BackendExhibitorBooth>(
		`v1/exhibitor_booths/${validated.id}/assign`,
		{ exhibitor_booth: { exhibitor_kit_id: validated.exhibitor_kit_id } },
	);

	return { success: true, booth: transformBooth(response) };
}

export async function deleteExhibitorBooth(
	data: DeleteExhibitorBoothRequest,
): Promise<DeleteExhibitorBoothResponse> {
	const validated = deleteExhibitorBoothSchema.parse(data);
	await kyClient.delete(`v1/exhibitor_booths/${validated.id}`);

	return { success: true };
}
