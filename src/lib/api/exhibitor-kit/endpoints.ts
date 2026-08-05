import type { ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment/response";
import { restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorKitRequest,
	createExhibitorKitSchema,
	type UpdateExhibitorKitRequest,
	updateExhibitorKitSchema,
} from "./request";
import type { ExhibitorKit } from "./response";

/**
 * Get all exhibitor kits for an event
 */
export async function getExhibitorKits(
	eventId: number,
): Promise<ExhibitorKit[]> {
	return restClient.get<ExhibitorKit[]>(`v1/events/${eventId}/exhibitor_kits`);
}

/**
 * Get a specific exhibitor kit
 */
export async function getExhibitorKit(
	eventId: number,
	kitId: number,
): Promise<ExhibitorKit> {
	return restClient.get<ExhibitorKit>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}`,
	);
}

/**
 * Create an exhibitor kit with items and printings
 * Used when vendors submit their orders
 */
export async function createExhibitorKit(
	eventId: number,
	data: CreateExhibitorKitRequest,
): Promise<ExhibitorKit> {
	const validated = createExhibitorKitSchema.parse(data);
	return restClient.post<ExhibitorKit>(`v1/events/${eventId}/exhibitor_kits`, {
		exhibitor_kit: validated,
	});
}

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

export async function deleteExhibitorKit(
	eventId: number,
	kitId: number,
): Promise<void> {
	await restClient.delete<void>(`v1/events/${eventId}/exhibitor_kits/${kitId}`);
}

export async function permanentlyDeleteExhibitorKit(
	eventId: number,
	kitId: number,
): Promise<void> {
	await restClient.delete<void>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/permanently_delete`,
	);
}

/**
 * Org-owner-only: hard-deletes a kit in any state, bypassing the cancel-first
 * requirement permanentlyDeleteExhibitorKit enforces.
 */
export async function forceDeleteExhibitorKit(
	eventId: number,
	kitId: number,
): Promise<void> {
	await restClient.delete<void>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/force_delete`,
	);
}

/**
 * Submit an exhibitor kit order
 * This auto-creates payment records for unpaid items and printings,
 * grouped by payee (item/service owner), and links them to the payments for tracking.
 * Returns an array of payments - one per unique payee.
 */
export async function submitExhibitorKitOrder(
	eventId: number,
	kitId: number,
): Promise<{ data: ExhibitorKitPayment[]; message: string }> {
	return restClient.post<{ data: ExhibitorKitPayment[]; message: string }>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/submit_order`,
		{},
	);
}

export async function downloadExhibitorKitIcCopy(
	eventId: number,
	kitId: number,
): Promise<{ blob: Blob; headers: Headers }> {
	return restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/ic_copy`,
	);
}

export async function downloadExhibitorKitCustomsDeclaration(
	eventId: number,
	kitId: number,
): Promise<{ blob: Blob; headers: Headers }> {
	return restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/customs_declaration`,
	);
}

export async function downloadExhibitorKitCustomsDutyEstimate(
	eventId: number,
	kitId: number,
): Promise<{ blob: Blob; headers: Headers }> {
	return restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/customs_duty_estimate`,
	);
}

export async function rejectExhibitorKitPaymentProof(
	eventId: number,
	kitId: number,
	note?: string,
): Promise<ExhibitorKit> {
	return restClient.post<ExhibitorKit>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/reject_payment_proof`,
		{ note: note || undefined },
	);
}
