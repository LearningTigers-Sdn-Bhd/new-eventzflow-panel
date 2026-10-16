import { kyClient, restClient } from "@/utils/rest-api";
import type {
	BackendEventEmailDelivery,
	BackendEventEmailListResponse,
	BackendEventEmailShowResponse,
	BackendEventEmailSummaryResponse,
	EmailStatusGroup,
	EventEmailDelivery,
	EventEmailDeliveryPage,
	EventEmailStatusSummary,
} from "./response";

const mapDelivery = (d: BackendEventEmailDelivery): EventEmailDelivery => ({
	id: d.id,
	emailType: d.email_type,
	recipient: d.recipient,
	subject: d.subject,
	status: d.status,
	problem: d.problem,
	createdAt: d.created_at,
	sentAt: d.sent_at,
	deliveredAt: d.delivered_at,
	problemAt: d.problem_at,
	attendee: d.attendee
		? { ticketId: d.attendee.ticket_id, name: d.attendee.name }
		: null,
	canResend: d.can_resend,
});

export interface GetEventEmailDeliveriesRequest {
	eventId: string;
	statusGroup?: EmailStatusGroup;
	emailType?: string;
	recipient?: string;
	page?: number;
	perPage?: number;
}

export async function getEventEmailDeliveries({
	eventId,
	statusGroup,
	emailType,
	recipient,
	page,
	perPage,
}: GetEventEmailDeliveriesRequest): Promise<EventEmailDeliveryPage> {
	const params = new URLSearchParams();
	if (statusGroup) params.set("status_group", statusGroup);
	if (emailType) params.set("email_type", emailType);
	if (recipient) params.set("recipient", recipient);
	if (page) params.set("page", String(page));
	if (perPage) params.set("per_page", String(perPage));
	const query = params.toString();

	const response = await restClient.get<BackendEventEmailListResponse>(
		`v1/events/${eventId}/email_deliveries${query ? `?${query}` : ""}`,
	);
	return {
		items: response.data.map(mapDelivery),
		pagination: {
			currentPage: response.pagination.current_page,
			totalPages: response.pagination.total_pages,
			totalCount: response.pagination.total_count,
			perPage: response.pagination.per_page,
		},
	};
}

export async function getEventEmailSummary(
	eventId: string,
): Promise<EventEmailStatusSummary> {
	const response = await restClient.get<BackendEventEmailSummaryResponse>(
		`v1/events/${eventId}/email_deliveries/summary`,
	);
	return { groups: response.data, emailTypes: response.email_types };
}

// `email` corrects the attendee's address before the retry.
export async function resendEventEmail(
	eventId: string,
	deliveryId: number,
	email?: string,
): Promise<EventEmailDelivery> {
	const response = await restClient.post<BackendEventEmailShowResponse>(
		`v1/events/${eventId}/email_deliveries/${deliveryId}/resend`,
		email ? { email } : {},
	);
	return mapDelivery(response.data);
}

/**
 * Every email for the event as an Excel workbook, split by outcome. Uses kyClient
 * directly so we get the raw blob with the session cookie.
 */
export async function downloadEventEmailReport(eventId: string): Promise<Blob> {
	const response = await kyClient.get(
		`v1/events/${eventId}/email_deliveries/export`,
	);
	return response.blob();
}
