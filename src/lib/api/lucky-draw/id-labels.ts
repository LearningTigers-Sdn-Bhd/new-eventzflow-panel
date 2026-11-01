import type { BackendTicket } from "@/lib/api/ticket/response";
import { restClient } from "@/utils/rest-api";

// ponytail: hardcoded event, move to an event setting if another event needs it
export const ID_LABEL_EVENT_ID = 35;

/** "010203-12-3456" -> "ID 123456". The letters keep maskPhone from masking it. */
export function toIdLabel(idNo: unknown): string | null {
	const clean = String(idNo ?? "").replace(/[^\p{L}\p{N}]/gu, "");
	return clean ? `ID ${clean.slice(-6)}` : null;
}

/** Last 6 of IC/passport per ticket id, so winners show it instead of a phone number. */
export async function getTicketIdLabels(
	eventId: string,
): Promise<Map<string, string>> {
	const tickets = await restClient.get<BackendTicket[]>(
		`v1/events/${eventId}/tickets?full=true`,
	);
	const labels = new Map<string, string>();
	for (const t of tickets) {
		const label = toIdLabel(t.custom_fields_data?.ic_passport_no);
		if (label) labels.set(String(t.id), label);
	}
	return labels;
}
