import { restClient } from "@/utils/rest-api";
import {
	type GetEmailDeliveriesRequest,
	getEmailDeliveriesSchema,
	type ResendEmailDeliveryRequest,
	resendEmailDeliverySchema,
} from "./request";
import type {
	BackendEmailDelivery,
	BackendEmailDeliveryListResponse,
	BackendEmailDeliveryShowResponse,
	EmailDelivery,
} from "./response";

const mapDelivery = (delivery: BackendEmailDelivery): EmailDelivery => ({
	id: delivery.id,
	provider: delivery.provider,
	providerMessageId: delivery.provider_message_id,
	mailerName: delivery.mailer_name,
	mailerAction: delivery.mailer_action,
	recipient: delivery.recipient,
	recipients: {
		to: delivery.recipients?.to ?? [],
		cc: delivery.recipients?.cc ?? [],
		bcc: delivery.recipients?.bcc ?? [],
	},
	subject: delivery.subject,
	status: delivery.status,
	relatedType: delivery.related_type,
	relatedId: delivery.related_id,
	sentAt: delivery.sent_at,
	deliveredAt: delivery.delivered_at,
	failedAt: delivery.failed_at,
	bouncedAt: delivery.bounced_at,
	complainedAt: delivery.complained_at,
	suppressedAt: delivery.suppressed_at,
	lastError: delivery.last_error,
	failureReason: delivery.failure_reason,
	retryCount: delivery.retry_count,
	nextRetryAt: delivery.next_retry_at,
	resendOfId: delivery.resend_of_id,
	createdAt: delivery.created_at,
	updatedAt: delivery.updated_at,
});

export async function getEmailDeliveries(
	data: GetEmailDeliveriesRequest = {},
): Promise<EmailDelivery[]> {
	const validated = getEmailDeliveriesSchema.parse(data);
	const searchParams = new URLSearchParams();

	if (validated.status) searchParams.set("status", validated.status);
	if (validated.recipient) searchParams.set("recipient", validated.recipient);
	if (validated.subject) searchParams.set("subject", validated.subject);
	if (validated.providerMessageId) {
		searchParams.set("provider_message_id", validated.providerMessageId);
	}
	if (validated.stuckSent !== undefined) {
		searchParams.set("stuck_sent", String(validated.stuckSent));
	}
	if (validated.page) searchParams.set("page", String(validated.page));
	if (validated.perPage)
		searchParams.set("per_page", String(validated.perPage));

	const query = searchParams.toString();
	const response = await restClient.get<BackendEmailDeliveryListResponse>(
		`v1/email_deliveries${query ? `?${query}` : ""}`,
	);

	return response.data.map(mapDelivery);
}

export async function getEmailDelivery(id: number): Promise<EmailDelivery> {
	const response = await restClient.get<BackendEmailDeliveryShowResponse>(
		`v1/email_deliveries/${id}`,
	);
	return mapDelivery(response.data);
}

export async function resendEmailDelivery(
	data: ResendEmailDeliveryRequest,
): Promise<EmailDelivery> {
	const validated = resendEmailDeliverySchema.parse(data);
	const response = await restClient.post<BackendEmailDeliveryShowResponse>(
		`v1/email_deliveries/${validated.id}/resend`,
		{},
	);
	return mapDelivery(response.data);
}
