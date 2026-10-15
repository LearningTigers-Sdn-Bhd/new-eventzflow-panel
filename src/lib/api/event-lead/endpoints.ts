import { restClient } from "@/utils/rest-api";
import {
	type CreateGlobalLeadRequest,
	type CreateLeadRequest,
	createGlobalLeadSchema,
	createLeadSchema,
	type UpdateLeadRequest,
	updateLeadSchema,
} from "./request";
import type { EventLead, EventLeadWithDetails } from "./response";

/**
 * Create a lead (vendor scans attendee QR code)
 */
export async function createLead(
	eventId: string,
	data: CreateLeadRequest,
): Promise<EventLead> {
	const validated = createLeadSchema.parse(data);
	return restClient.post<EventLead>(`v1/events/${eventId}/event-leads`, {
		event_lead: validated,
	});
}

/**
 * Get all leads for an event
 */
export async function getEventLeads(
	eventId: string,
): Promise<EventLeadWithDetails[]> {
	return restClient.get<EventLeadWithDetails[]>(
		`v1/events/${eventId}/event-leads`,
	);
}

/**
 * Update notes on an existing lead
 */
export async function updateLead(
	eventId: string,
	leadId: number,
	data: UpdateLeadRequest,
): Promise<EventLead> {
	const validated = updateLeadSchema.parse(data);
	return restClient.patch<EventLead>(
		`v1/events/${eventId}/event-leads/${leadId}`,
		{ event_lead: validated },
	);
}

/**
 * Create a lead by scanning ticket globally (backend auto-detects event + assignment)
 */
export async function createGlobalLead(
	data: CreateGlobalLeadRequest,
): Promise<EventLead> {
	const validated = createGlobalLeadSchema.parse(data);
	return restClient.post<EventLead>("v1/event-leads/scan", {
		event_lead: validated,
	});
}

/**
 * Get latest scanned leads for current user across assigned events
 */
export async function getRecentGlobalLeads(
	limit = 20,
): Promise<EventLeadWithDetails[]> {
	return restClient.get<EventLeadWithDetails[]>(
		`v1/event-leads/recent?limit=${limit}`,
	);
}

/**
 * Download the styled Excel workbook of captured leads for an event
 * (own leads only for a vendor, all leads for staff — same scoping as getEventLeads).
 */
export async function exportEventLeads(eventId: string): Promise<void> {
	const { blob, headers } = await restClient.getBlob(
		`v1/events/${eventId}/event-leads/export`,
	);

	let filename = `event-leads-${eventId}.xlsx`;
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
