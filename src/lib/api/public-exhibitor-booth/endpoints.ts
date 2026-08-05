import { publicRestClient } from "@/utils/rest-api";
import {
	type GetPublicExhibitorBoothsRequest,
	getPublicExhibitorBoothsSchema,
} from "./request";
import type {
	PublicExhibitorBooth,
	PublicExhibitorBoothsResponse,
} from "./response";

export async function getPublicExhibitorBooths(
	data: GetPublicExhibitorBoothsRequest,
): Promise<PublicExhibitorBooth[]> {
	const validated = getPublicExhibitorBoothsSchema.parse(data);
	const params = new URLSearchParams({
		exhibitor_booth_price_id: String(validated.exhibitor_booth_price_id),
	});
	const response = await publicRestClient.get<PublicExhibitorBoothsResponse>(
		`v1/public/events/${validated.event_slug}/exhibitor_booths?${params.toString()}`,
	);

	return response.data;
}
