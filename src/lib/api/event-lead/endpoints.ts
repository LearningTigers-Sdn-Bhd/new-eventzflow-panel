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
