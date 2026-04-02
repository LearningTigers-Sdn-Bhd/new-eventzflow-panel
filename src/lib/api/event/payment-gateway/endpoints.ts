import { API_BASE_URL, restClient } from "@/utils/rest-api";
import {
	type CreatePaymentGatewayRequest,
	createPaymentGatewaySchema,
	type UpdatePaymentGatewayRequest,
	updatePaymentGatewaySchema,
} from "./request";
import type { EventPaymentGatewayResponse } from "./response";

const SHARED_WEBHOOK_PATH = "v1/public/payments/webhook";

export function getSharedPaymentGatewayWebhookUrl(): string {
	const baseUrl = new URL(API_BASE_URL);
	const normalizedBasePath = baseUrl.pathname.endsWith("/")
		? baseUrl.pathname
		: `${baseUrl.pathname}/`;

	return new URL(
		SHARED_WEBHOOK_PATH,
		`${baseUrl.origin}${normalizedBasePath}`,
	).toString();
}

/**
 * Get payment gateway settings for an event
 */
export async function getEventPaymentGateway(
	eventId: string,
): Promise<EventPaymentGatewayResponse> {
	return restClient.get<EventPaymentGatewayResponse>(
		`v1/events/${eventId}/event_payment_gateway`,
	);
}

/**
 * Create payment gateway settings for an event
 */
export async function createEventPaymentGateway(
	eventId: string,
	data: CreatePaymentGatewayRequest,
): Promise<EventPaymentGatewayResponse> {
	const validated = createPaymentGatewaySchema.parse(data);
	return restClient.post<EventPaymentGatewayResponse>(
		`v1/events/${eventId}/event_payment_gateway`,
		{ event_payment_gateway: validated },
	);
}

/**
 * Update payment gateway settings for an event
 */
export async function updateEventPaymentGateway(
	eventId: string,
	data: UpdatePaymentGatewayRequest,
): Promise<EventPaymentGatewayResponse> {
	const validated = updatePaymentGatewaySchema.parse(data);
	return restClient.put<EventPaymentGatewayResponse>(
		`v1/events/${eventId}/event_payment_gateway`,
		{ event_payment_gateway: validated },
	);
}

/**
 * Remove custom payment gateway (revert to default)
 */
export async function deleteEventPaymentGateway(
	eventId: string,
): Promise<void> {
	await restClient.delete(`v1/events/${eventId}/event_payment_gateway`);
}
