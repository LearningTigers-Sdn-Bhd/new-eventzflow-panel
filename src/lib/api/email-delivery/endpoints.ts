import { restClient } from "@/utils/rest-api";
import {
	type GetEmailDeliveriesRequest,
	getEmailDeliveriesSchema,
	type ResendEmailDeliveryRequest,
	resendEmailDeliverySchema,
	type UpdateEmailLogSettingsRequest,
	updateEmailLogSettingsSchema,
} from "./request";
import type {
	BackendEmailDelivery,
	BackendEmailDeliveryListResponse,
	BackendEmailDeliveryShowResponse,
	BackendEmailDeliverySummaryResponse,
	BackendEmailLogSettingsResponse,
	EmailDelivery,
	EmailDeliveryPage,
	EmailDeliverySummary,
	EmailLogSettings,
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
): Promise<EmailDeliveryPage> {
	const validated = getEmailDeliveriesSchema.parse(data);
	const searchParams = new URLSearchParams();

	if (validated.eventId)
		searchParams.set("event_id", String(validated.eventId));
	if (validated.status) searchParams.set("status", validated.status);
	if (validated.recipient) searchParams.set("recipient", validated.recipient);
	if (validated.search) searchParams.set("search", validated.search);
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

export async function getEmailDeliverySummary(
	eventId?: number,
): Promise<EmailDeliverySummary> {
	const query = eventId ? `?event_id=${eventId}` : "";
	const response = await restClient.get<BackendEmailDeliverySummaryResponse>(
		`v1/email_deliveries/summary${query}`,
	);
	return response.data;
}

const mapSettings = (
	data: BackendEmailLogSettingsResponse["data"],
): EmailLogSettings => ({
	retentionDays: data.retention_days,
	protectedRetentionDays: data.protected_retention_days,
	purgeEnabled: data.purge_enabled,
	rowsToPurge: data.rows_to_purge,
});

// With `preview`, the backend reports rowsToPurge for those values without
// saving them.
export async function getEmailLogSettings(preview?: {
	retentionDays: number;
	protectedRetentionDays: number;
}): Promise<EmailLogSettings> {
	const query = preview
		? `?retention_days=${preview.retentionDays}&protected_retention_days=${preview.protectedRetentionDays}`
		: "";
	const response = await restClient.get<BackendEmailLogSettingsResponse>(
		`v1/email_deliveries/settings${query}`,
	);
	return mapSettings(response.data);
}

export async function updateEmailLogSettings(
	data: UpdateEmailLogSettingsRequest,
): Promise<EmailLogSettings> {
	const validated = updateEmailLogSettingsSchema.parse(data);
	const response = await restClient.patch<BackendEmailLogSettingsResponse>(
		"v1/email_deliveries/settings",
		{
			retention_days: validated.retentionDays,
			protected_retention_days: validated.protectedRetentionDays,
			purge_enabled: validated.purgeEnabled,
		},
	);
	return mapSettings(response.data);
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
