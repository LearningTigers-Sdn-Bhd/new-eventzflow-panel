import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient, restClient } from "@/utils/rest-api";
import type { SaveFeedbackFormRequest, SubmitFeedbackRequest } from "./request";
import type {
	FeedbackForm,
	FeedbackFormEnvelope,
	FeedbackResponseEnvelope,
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

/** Organizer: create or update the form; the question list is replaced wholesale. */
export async function saveFeedbackForm(
	eventId: string,
	data: SaveFeedbackFormRequest,
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
		throw new Error(await extractErrorMessage(error));
	}
}

/** Public: active form for an event, by event slug. */
export async function getPublicFeedbackForm(
	eventSlug: string,
): Promise<FeedbackForm> {
	try {
		const response = await publicRestClient.get<FeedbackFormEnvelope>(
			`v1/public/events/${eventSlug}/feedback_form`,
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
