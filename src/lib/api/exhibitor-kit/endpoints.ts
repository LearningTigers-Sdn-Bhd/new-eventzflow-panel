import { restClient } from "@/utils/rest-api";
import type { ExhibitorKit } from "./response";
import {
	type UpdateExhibitorKitRequest,
	updateExhibitorKitSchema,
} from "./request";

/**
 * Update an exhibitor kit
 * Used for editing booth info, payment status, team members, etc.
 */
export async function updateExhibitorKit(
	eventId: number,
	kitId: number,
	data: UpdateExhibitorKitRequest,
): Promise<ExhibitorKit> {
	const validated = updateExhibitorKitSchema.parse(data);
	return restClient.patch<ExhibitorKit>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}`,
		{
			exhibitor_kit: validated,
		},
	);
}
