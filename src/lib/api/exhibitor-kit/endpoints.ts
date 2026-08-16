import type { ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment/response";
import { restClient } from "@/utils/rest-api";
import {
	type CreateExhibitorKitRequest,
	createExhibitorKitSchema,
	type UpdateExhibitorKitRequest,
	updateExhibitorKitSchema,
} from "./request";
import type { ExhibitorKit, ImportExhibitorKitsResponse } from "./response";

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

async function downloadExhibitorKitExport(
	eventId: number,
	format: "xlsx" | "csv",
	fallbackFilename: string,
): Promise<void> {
	const { blob, headers } = await restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/export?format=${format}`,
	);

	let filename = fallbackFilename;
	const contentDisposition = headers.get("Content-Disposition");
	if (contentDisposition) {
		// Prefer the quoted filename="..." segment; Rails also appends an
		// RFC 5987 filename*=UTF-8''... segment which a greedy match would swallow.
		const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
		if (filenameMatch) {
			filename = filenameMatch[1];
		}
	}

	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

/**
 * Download the multi-sheet Excel workbook of registered exhibitor kits for an event
 * (Summary, Registered Exhibitor, Exhibitor Crew sheets).
 */
export async function exportExhibitorKits(eventId: number): Promise<void> {
	return downloadExhibitorKitExport(
		eventId,
		"xlsx",
		`exhibitor-kits-${eventId}.xlsx`,
	);
}

/**
 * Download a plain CSV of registered exhibitor kits for an event (same columns as
 * the Excel report's "Registered Exhibitor" sheet).
 */
export async function exportExhibitorKitsCsv(eventId: number): Promise<void> {
	return downloadExhibitorKitExport(
		eventId,
		"csv",
		`exhibitor-kits-${eventId}.csv`,
	);
}

/**
 * Download the exhibitor import template (.xlsx) for an event — main "Exhibitors"
 * sheet to fill in plus a read-only "Reference" sheet of current booth pricing.
 */
export async function downloadExhibitorKitImportTemplate(
	eventId: number,
): Promise<void> {
	const { blob, headers } = await restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/import_template`,
	);

	let filename = `exhibitor-import-template-${eventId}.xlsx`;
	const contentDisposition = headers.get("Content-Disposition");
	if (contentDisposition) {
		const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
		if (filenameMatch) {
			filename = filenameMatch[1];
		}
	}

	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

/**
 * Upload a filled-in exhibitor import workbook. Pass `dryRun: true` to validate
 * without persisting the rows. `forceDuplicateRows` re-submits specific row
 * numbers that a previous preview/import flagged as matching an existing
 * booking (same vendor/booth/package/quantity) — the admin explicitly wants
 * that duplicate created anyway.
 */
export async function importExhibitorKits(
	eventId: number,
	file: File,
	options?: { dryRun?: boolean; forceDuplicateRows?: number[] },
): Promise<ImportExhibitorKitsResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const params = new URLSearchParams();
	if (options?.dryRun) {
		params.append("dry_run", "true");
	}
	for (const row of options?.forceDuplicateRows ?? []) {
		params.append("force_duplicate_rows[]", String(row));
	}
	const queryString = params.toString();
	const url = queryString
		? `v1/events/${eventId}/exhibitor_kits/import?${queryString}`
		: `v1/events/${eventId}/exhibitor_kits/import`;

	return restClient.postFormData<ImportExhibitorKitsResponse>(url, formData);
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

export async function downloadExhibitorKitIndemnityForm(
	eventId: number,
	kitId: number,
): Promise<{ blob: Blob; headers: Headers }> {
	return restClient.getBlob(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/indemnity_form`,
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
