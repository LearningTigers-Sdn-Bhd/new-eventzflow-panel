import { API_BASE_URL, restClient } from "@/utils/rest-api";
import {
	type SendCertificatesRequest,
	sendCertificatesSchema,
	type UpsertCertificateTemplateRequest,
	upsertCertificateTemplateSchema,
} from "./request";
import type {
	CertificateAudience,
	CertificateParticipant,
	CertificateTemplate,
	SendCertificatesResponse,
	SendOneCertificateResponse,
} from "./response";

const templatesPath = (eventId: string) =>
	`v1/events/${eventId}/certificate_templates`;

/**
 * List every certificate template of an event (empty when none exist yet).
 */
export async function getCertificateTemplates(
	eventId: string,
): Promise<CertificateTemplate[]> {
	const response = await restClient.get<CertificateTemplate[] | null>(
		templatesPath(eventId),
	);
	return response ?? [];
}

/**
 * Create a template. Pass duplicateFromId to copy another template's design
 * (fields, canvas and background) so only the wording needs changing.
 */
export async function createCertificateTemplate(
	eventId: string,
	data: UpsertCertificateTemplateRequest,
	duplicateFromId?: number,
): Promise<CertificateTemplate> {
	const validated = upsertCertificateTemplateSchema.parse(data);
	return await restClient.post<CertificateTemplate>(templatesPath(eventId), {
		certificate_template: validated,
		duplicate_from_id: duplicateFromId,
	});
}

/**
 * Update a template (JSON, no image).
 */
export async function updateCertificateTemplate(
	eventId: string,
	templateId: number,
	data: UpsertCertificateTemplateRequest,
): Promise<CertificateTemplate> {
	const validated = upsertCertificateTemplateSchema.parse(data);
	return await restClient.patch<CertificateTemplate>(
		`${templatesPath(eventId)}/${templateId}`,
		{ certificate_template: validated },
	);
}

/**
 * Upload (or replace) the background image of a template.
 * Multipart PATCH; can be combined with other template fields if needed.
 */
export async function uploadCertificateBackground(
	eventId: string,
	templateId: number,
	file: File,
): Promise<CertificateTemplate> {
	const formData = new FormData();
	formData.append("certificate_template[background_image]", file);
	return await restClient.patchFormData<CertificateTemplate>(
		`${templatesPath(eventId)}/${templateId}`,
		formData,
	);
}

/**
 * Remove the background image from a template.
 */
export async function removeCertificateBackground(
	eventId: string,
	templateId: number,
): Promise<CertificateTemplate> {
	return await restClient.patch<CertificateTemplate>(
		`${templatesPath(eventId)}/${templateId}`,
		{ certificate_template: { remove_background_image: true } },
	);
}

/**
 * Delete a template entirely.
 */
export async function deleteCertificateTemplate(
	eventId: string,
	templateId: number,
): Promise<void> {
	await restClient.delete(`${templatesPath(eventId)}/${templateId}`);
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
 * Pass a ticket public_id to render a real attendee's certificate (its own
 * template), or a templateId for that template with a placeholder "Attendee
 * Name" sample.
 */
export function certificatePreviewPath(
	eventId: string,
	options?: { ticketId?: string; templateId?: number; download?: boolean },
): string {
	const params = new URLSearchParams();
	if (options?.templateId) {
		params.append("template_id", String(options.templateId));
	}
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
	options?: { ticketId?: string; templateId?: number; download?: boolean },
): string {
	return `${API_BASE_URL}/${certificatePreviewPath(eventId, options)}`;
}

/**
 * Download a certificate PDF as a Blob (authenticated). Use for the panel
 * "Download" / "Preview" buttons so the bearer token is attached.
 */
export async function downloadCertificate(
	eventId: string,
	options?: { ticketId?: string; templateId?: number },
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
	audience: CertificateAudience = "all",
): Promise<Blob> {
	const { blob } = await restClient.getBlob(
		`v1/events/${eventId}/certificates/download_all?audience=${audience}`,
	);
	return blob;
}
