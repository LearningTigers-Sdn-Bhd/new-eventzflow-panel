import type { z } from "zod";
import type { emailDeliveryStatusSchema } from "./request";

export interface BackendEmailDelivery {
	id: number;
	provider: string;
	provider_message_id: string | null;
	mailer_name: string;
	mailer_action: string;
	recipient: string | null;
	recipients: {
		to?: string[];
		cc?: string[];
		bcc?: string[];
	};
	subject: string | null;
	status: z.infer<typeof emailDeliveryStatusSchema>;
	related_type: string | null;
	related_id: number | null;
	sent_at: string | null;
	delivered_at: string | null;
	failed_at: string | null;
	bounced_at: string | null;
	complained_at: string | null;
	suppressed_at: string | null;
	last_error: string | null;
	failure_reason: string | null;
	retry_count: number;
	next_retry_at: string | null;
	resend_of_id: number | null;
	created_at: string;
	updated_at: string;
}

export interface BackendEmailDeliveryPagination {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
}

export interface EmailDeliveryPage {
	items: EmailDelivery[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		perPage: number;
	};
}

export interface BackendEmailLogSettingsResponse {
	data: {
		retention_days: number;
		protected_retention_days: number;
		rows_to_purge: number;
	};
}

export interface EmailLogSettings {
	retentionDays: number;
	protectedRetentionDays: number;
	// Rows already past their window, deleted by the next nightly run.
	rowsToPurge: number;
}

export interface BackendEmailDeliverySummaryResponse {
	data: Partial<Record<z.infer<typeof emailDeliveryStatusSchema>, number>>;
}

export type EmailDeliverySummary = BackendEmailDeliverySummaryResponse["data"];

export interface BackendEmailDeliveryListResponse {
	data: BackendEmailDelivery[];
	pagination: BackendEmailDeliveryPagination;
}

export interface BackendEmailDeliveryShowResponse {
	data: BackendEmailDelivery;
}

export interface EmailDelivery {
	id: number;
	provider: string;
	providerMessageId: string | null;
	mailerName: string;
	mailerAction: string;
	recipient: string | null;
	recipients: {
		to: string[];
		cc: string[];
		bcc: string[];
	};
	subject: string | null;
	status: z.infer<typeof emailDeliveryStatusSchema>;
	relatedType: string | null;
	relatedId: number | null;
	sentAt: string | null;
	deliveredAt: string | null;
	failedAt: string | null;
	bouncedAt: string | null;
	complainedAt: string | null;
	suppressedAt: string | null;
	lastError: string | null;
	failureReason: string | null;
	retryCount: number;
	nextRetryAt: string | null;
	resendOfId: number | null;
	createdAt: string;
	updatedAt: string;
}
