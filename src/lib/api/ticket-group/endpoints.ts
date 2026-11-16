import { restClient } from "@/utils/rest-api";
import type {
	TicketGroupMode,
	TicketGroupPreview,
	TicketGroupsPayload,
} from "./response";

const base = (eventId: string) => `v1/events/${eventId}/ticket_groups`;

export const getTicketGroups = (eventId: string) =>
	restClient.get<TicketGroupsPayload>(base(eventId));

export const setupTicketGroups = (eventId: string, count: number) =>
	restClient.post<TicketGroupsPayload>(`${base(eventId)}/setup`, { count });

export const updateTicketGroup = (
	eventId: string,
	id: number,
	data: { name?: string; priority_ticket_type_ids?: number[] },
) => restClient.patch<TicketGroupsPayload>(`${base(eventId)}/${id}`, data);

export const deleteTicketGroup = (eventId: string, id: number) =>
	restClient.delete<TicketGroupsPayload>(`${base(eventId)}/${id}`);

export const previewTicketGroups = (eventId: string, mode: TicketGroupMode) =>
	restClient.post<TicketGroupPreview>(`${base(eventId)}/preview`, { mode });

export const assignTicketGroups = (eventId: string, mode: TicketGroupMode) =>
	restClient.post<TicketGroupsPayload & { assigned: number }>(
		`${base(eventId)}/assign`,
		{ mode },
	);

export const moveTicketsToGroup = (
	eventId: string,
	publicIds: string[],
	ticketGroupId: number | null,
) =>
	restClient.patch<TicketGroupsPayload & { moved: number }>(
		`${base(eventId)}/move`,
		{ public_ids: publicIds, ticket_group_id: ticketGroupId },
	);
