import type { BackendTicket } from "@/lib/api/ticket/response";
import { restClient } from "@/utils/rest-api";

// ponytail: hardcoded event, move to an event setting if another event needs it
export const ID_LABEL_EVENT_ID = 35;

/** "010203-12-3456" -> "ID 123456". The letters keep maskPhone from masking it. */
export function toIdLabel(idNo: unknown): string | null {
	const clean = String(idNo ?? "").replace(/[^\p{L}\p{N}]/gu, "");
	return clean ? `ID ${clean.slice(-6)}` : null;
}

export type TicketIds = {
	/** "ID 123456" per ticket id, for the screens the crowd sees */
	labels: Map<string, string>;
	/** Full IC/passport per ticket id, for the organizer's lists */
	full: Map<string, string>;
	/** Public ticket id (what the attendee shows) per ticket id */
	publicIds: Map<string, string>;
};

/** IC/passport per ticket id, so winners show it instead of a phone number. */
export async function getTicketIdLabels(eventId: string): Promise<TicketIds> {
	const tickets = await restClient.get<BackendTicket[]>(
		`v1/events/${eventId}/tickets?full=true`,
	);
	const ids: TicketIds = {
		labels: new Map(),
		full: new Map(),
		publicIds: new Map(),
	};
	for (const t of tickets) {
		const idNo = String(t.custom_fields_data?.ic_passport_no ?? "").trim();
		ids.publicIds.set(String(t.id), t.public_id);
		const label = toIdLabel(idNo);
		if (!label) continue;
		ids.labels.set(String(t.id), label);
		ids.full.set(String(t.id), idNo);
	}
	return ids;
}
