import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient, restClient } from "@/utils/rest-api";
import type { SaveFeedbackFormRequest, SubmitFeedbackRequest } from "./request";
import type {
	FeedbackAiSummaryEnvelope,
	FeedbackAiSummaryState,
	FeedbackCommentsEnvelope,
	FeedbackExportData,
	FeedbackExportEnvelope,
	FeedbackFilters,
	FeedbackForm,
	FeedbackFormEnvelope,
	FeedbackNonRespondersEnvelope,
	FeedbackRemindEnvelope,
	FeedbackRemindResult,
	FeedbackResponseEnvelope,
	FeedbackResponsesEnvelope,
	FeedbackSummary,
	FeedbackSummaryEnvelope,
} from "./response";

/** Organizer: the event's form, or null when none has been created yet. */
export async function getFeedbackForm(
	eventId: string,
): Promise<FeedbackForm | null> {
	const response = await restClient.get<FeedbackFormEnvelope>(
		`v1/events/${eventId}/feedback_form`,
	);
	return response.data ?? null;
}

/** Thrown on 409: someone else saved the form after this editor loaded it. */
export class FeedbackConflictError extends Error {
	constructor(readonly latest: FeedbackForm | undefined) {
		super("This form was changed by someone else since you opened it.");
	}
}

/** Organizer: create or update the form; the question list is replaced wholesale. Omit fields to leave them unchanged. */
export async function saveFeedbackForm(
	eventId: string,
	data: Partial<SaveFeedbackFormRequest>,
	exists: boolean,
): Promise<FeedbackForm> {
	const url = `v1/events/${eventId}/feedback_form`;
	const body = { feedback_form: data };
	try {
		const response = exists
			? await restClient.patch<FeedbackFormEnvelope>(url, body)
			: await restClient.post<FeedbackFormEnvelope>(url, body);
		return response.data as FeedbackForm;
	} catch (error: unknown) {
		const res = (error as { response?: Response }).response;
		if (res?.status === 409) {
			const body = (await res.json().catch(() => null)) as {
				data?: FeedbackForm;
			} | null;
			throw new FeedbackConflictError(body?.data);
		}
		throw new Error(await extractErrorMessage(error));
	}
}

/** Public: active form for an event, by event slug. */
export async function getPublicFeedbackForm(
	eventSlug: string,
	ticketPublicId?: string,
): Promise<FeedbackForm> {
	const query = ticketPublicId
		? `?${new URLSearchParams({ ticket: ticketPublicId })}`
		: "";
	try {
		const response = await publicRestClient.get<FeedbackFormEnvelope>(
			`v1/public/events/${eventSlug}/feedback_form${query}`,
		);
		return response.data as FeedbackForm;
	} catch (error: unknown) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function submitFeedback(data: SubmitFeedbackRequest) {
	try {
		const response = await publicRestClient.post<FeedbackResponseEnvelope>(
			"v1/public/feedback_responses",
			data,
		);
		return response.data;
	} catch (error: unknown) {
		throw new Error(await extractErrorMessage(error));
	}
}

/** Query string for the shared filters; unset or "all" values are left out. */
export function feedbackFilterParams(
	filters: FeedbackFilters = {},
	extra: Record<string, string | undefined> = {},
) {
	const query = new URLSearchParams();
	if (filters.ticketTypeId && filters.ticketTypeId !== "all") {
		query.set("ticket_type_id", filters.ticketTypeId);
	}
	if (filters.from) query.set("from", filters.from);
	if (filters.to) query.set("to", filters.to);
	for (const [key, value] of Object.entries(extra)) {
		if (value) query.set(key, value);
	}
	return query;
}

/** Organizer: aggregate response counts for each question. */
export async function getFeedbackSummary(
	eventId: string,
	filters: FeedbackFilters = {},
): Promise<FeedbackSummary | null> {
	const query = feedbackFilterParams(filters).toString();
	const response = await restClient.get<FeedbackSummaryEnvelope>(
		`v1/events/${eventId}/feedback_form/summary${query ? `?${query}` : ""}`,
	);
	return response.data ?? null;
}

/** Organizer: one page of individual feedback responses (25 per page). */
export async function getFeedbackResponses(
	eventId: string,
	page: number,
	search = "",
	filters: FeedbackFilters = {},
): Promise<FeedbackResponsesEnvelope> {
	const query = feedbackFilterParams(filters, {
		page: String(page),
		q: search.trim() || undefined,
	});
	return restClient.get<FeedbackResponsesEnvelope>(
		`v1/events/${eventId}/feedback_form/responses?${query.toString()}`,
	);
}

/** Organizer: every text answer, newest first, with search and score filters. */
export async function getFeedbackComments(
	eventId: string,
	options: {
		page: number;
		search?: string;
		questionId?: string;
		maxRating?: string;
		filters?: FeedbackFilters;
	},
): Promise<FeedbackCommentsEnvelope> {
	const query = feedbackFilterParams(options.filters, {
		page: String(options.page),
		q: options.search?.trim() || undefined,
		question_id:
			options.questionId && options.questionId !== "all"
				? options.questionId
				: undefined,
		max_rating:
			options.maxRating && options.maxRating !== "all"
				? options.maxRating
				: undefined,
	});
	return restClient.get<FeedbackCommentsEnvelope>(
		`v1/events/${eventId}/feedback_form/comments?${query.toString()}`,
	);
}

/** Organizer: checked-in attendees who have not responded yet. */
export async function getFeedbackNonResponders(
	eventId: string,
	options: { page: number; search?: string; filters?: FeedbackFilters },
): Promise<FeedbackNonRespondersEnvelope> {
	const query = feedbackFilterParams(options.filters, {
		page: String(options.page),
		q: options.search?.trim() || undefined,
	});
	return restClient.get<FeedbackNonRespondersEnvelope>(
		`v1/events/${eventId}/feedback_form/non_responders?${query.toString()}`,
	);
}

/** Organizer: re-send the thank-you (feedback) email to chosen attendees, or everyone outstanding. */
export async function sendFeedbackReminders(
	eventId: string,
	target: { ticketIds: string[] } | { all: true },
	filters: FeedbackFilters = {},
): Promise<FeedbackRemindResult> {
	const query = feedbackFilterParams(filters).toString();
	const body =
		"all" in target ? { all: true } : { ticket_ids: target.ticketIds };
	try {
		const response = await restClient.post<FeedbackRemindEnvelope>(
			`v1/events/${eventId}/feedback_form/remind${query ? `?${query}` : ""}`,
			body,
		);
		return response.data;
	} catch (error: unknown) {
		throw new Error(await extractErrorMessage(error));
	}
}

/** Organizer: everything needed to build CSV, Excel and PDF files. */
export async function getFeedbackExportData(
	eventId: string,
	filters: FeedbackFilters = {},
): Promise<FeedbackExportData> {
	const query = feedbackFilterParams(filters).toString();
	try {
		const response = await restClient.get<FeedbackExportEnvelope>(
			`v1/events/${eventId}/feedback_form/export_data${query ? `?${query}` : ""}`,
		);
		return response.data;
	} catch (error: unknown) {
		throw new Error(await extractErrorMessage(error));
	}
}

/** The latest stored AI summary and what the current user may do (only org owners can generate). */
export async function getFeedbackAiSummary(
	eventId: string,
): Promise<FeedbackAiSummaryState> {
	const response = await restClient.get<FeedbackAiSummaryEnvelope>(
		`v1/events/${eventId}/feedback_form/ai_summary`,
	);
	return response.data;
}

/** Org owner only: queue a new AI summary of the comments for the given filters. */
export async function generateFeedbackAiSummary(
	eventId: string,
	filters: FeedbackFilters = {},
): Promise<FeedbackAiSummaryState> {
	const query = feedbackFilterParams(filters).toString();
	try {
		const response = await restClient.post<FeedbackAiSummaryEnvelope>(
			`v1/events/${eventId}/feedback_form/ai_summary${query ? `?${query}` : ""}`,
			{},
		);
		return response.data;
	} catch (error: unknown) {
		throw new Error(await extractErrorMessage(error));
	}
}
