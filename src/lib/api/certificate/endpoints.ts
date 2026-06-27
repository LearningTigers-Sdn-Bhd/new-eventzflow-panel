import { API_BASE_URL, restClient } from "@/utils/rest-api";
import {
	type SendCertificatesRequest,
	sendCertificatesSchema,
	type UpsertCertificateTemplateRequest,
	upsertCertificateTemplateSchema,
} from "./request";
import type {
	CertificateParticipant,
	CertificateTemplate,
	SendCertificatesResponse,
	SendOneCertificateResponse,
} from "./response";

/**
 * Get the certificate template for an event. Returns null when none exists yet.
 */
export async function getCertificateTemplate(
	eventId: string,
): Promise<CertificateTemplate | null> {
	const response = await restClient.get<CertificateTemplate | null>(
		`v1/events/${eventId}/certificate_template`,
	);
	return response ?? null;
}

/**
 * Create or update the certificate template (JSON, no image).
 * Uses PUT which the backend maps to update/upsert.
 */
export async function upsertCertificateTemplate(
	eventId: string,
	data: UpsertCertificateTemplateRequest,
): Promise<CertificateTemplate> {
	const validated = upsertCertificateTemplateSchema.parse(data);
	return await restClient.put<CertificateTemplate>(
		`v1/events/${eventId}/certificate_template`,
		{ certificate_template: validated },
	);
}

/**
 * Upload (or replace) the background image for the certificate template.
 * Multipart PATCH; can be combined with other template fields if needed.
 */
export async function uploadCertificateBackground(
	eventId: string,
	file: File,
): Promise<CertificateTemplate> {
	const formData = new FormData();
	formData.append("certificate_template[background_image]", file);
	return await restClient.patchFormData<CertificateTemplate>(
		`v1/events/${eventId}/certificate_template`,
		formData,
	);
}

/**
 * Remove the background image from the certificate template.
 */
export async function removeCertificateBackground(
	eventId: string,
): Promise<CertificateTemplate> {
	return await restClient.patch<CertificateTemplate>(
		`v1/events/${eventId}/certificate_template`,
		{ certificate_template: { remove_background_image: true } },
	);
}

/**
 * Delete the certificate template entirely.
 */
export async function deleteCertificateTemplate(
	eventId: string,
): Promise<void> {
	await restClient.delete(`v1/events/${eventId}/certificate_template`);
}

/**
 * Queue a batch send of certificates to the event's attendees.
 */
export async function sendCertificates(
	eventId: string,
	data: SendCertificatesRequest,
): Promise<SendCertificatesResponse> {
	const validated = sendCertificatesSchema.parse(data);
	return await restClient.post<SendCertificatesResponse>(
		`v1/events/${eventId}/certificates/send_batch`,
		validated,
	);
}

/**
 * List participants (ticket holders with email) and their certificate status.
 */
export async function getCertificateParticipants(
	eventId: string,
): Promise<CertificateParticipant[]> {
	const response = await restClient.get<{ data: CertificateParticipant[] }>(
		`v1/events/${eventId}/certificates/participants`,
	);
	return response.data;
}

/**
 * Send (or resend) a certificate to a single participant by ticket public_id.
 */
export async function sendOneCertificate(
	eventId: string,
	publicId: string,
): Promise<SendOneCertificateResponse> {
	return await restClient.post<SendOneCertificateResponse>(
		`v1/events/${eventId}/certificates/send_one`,
		{ public_id: publicId },
	);
}

/**
 * Build the relative preview endpoint path (for restClient.getBlob downloads).
 * Pass a ticket public_id to render a real attendee's certificate; omit for a
 * placeholder "Attendee Name" sample.
 */
export function certificatePreviewPath(
	eventId: string,
	options?: { ticketId?: string; download?: boolean },
): string {
	const params = new URLSearchParams();
	if (options?.ticketId) {
		params.append("ticket_id", options.ticketId);
	}
	if (options?.download) {
		params.append("download", "true");
	}
	const qs = params.toString();
	return qs
		? `v1/events/${eventId}/certificates/preview?${qs}`
		: `v1/events/${eventId}/certificates/preview`;
}

/**
 * Fully-qualified preview URL (e.g. for opening in a new tab).
 * Note: opening in a new tab does not carry the Authorization header; prefer
 * downloadCertificate() for authenticated fetches.
 */
export function certificatePreviewUrl(
	eventId: string,
	options?: { ticketId?: string; download?: boolean },
): string {
	return `${API_BASE_URL}/${certificatePreviewPath(eventId, options)}`;
}

/**
 * Download a certificate PDF as a Blob (authenticated). Use for the panel
 * "Download" / "Preview" buttons so the bearer token is attached.
 */
export async function downloadCertificate(
	eventId: string,
	options?: { ticketId?: string },
): Promise<Blob> {
	const { blob } = await restClient.getBlob(
		certificatePreviewPath(eventId, { ...options, download: true }),
	);
	return blob;
}

/**
 * Download a single combined PDF (one certificate per page) for all attendees
 * matching the given audience.
 */
export async function downloadAllCertificates(
	eventId: string,
	audience: "all" | "checked_in" | "unsent" = "all",
): Promise<Blob> {
	const { blob } = await restClient.getBlob(
		`v1/events/${eventId}/certificates/download_all?audience=${audience}`,
	);
	return blob;
}
