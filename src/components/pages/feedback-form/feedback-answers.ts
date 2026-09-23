import type { FeedbackQuestion } from "@/lib/api/feedback-form";

/** multi_choice holds the selected options; every other type holds a string. */
export type FeedbackAnswerValues = Record<number, string | string[]>;

function isBlank(value: string | string[] | undefined) {
	return Array.isArray(value) ? value.length === 0 : !value?.trim();
}

/** Required questions the attendee has not answered yet. */
export function missingRequired(
	questions: FeedbackQuestion[],
	values: FeedbackAnswerValues,
) {
	return questions.filter((q) => q.required && isBlank(values[q.id]));
}

/**
 * Shape answers for the API. Blank answers are dropped; multi_choice is sent
 * as a JSON array string, which is what the backend validates and stores.
 */
export function toAnswerPayload(
	questions: FeedbackQuestion[],
	values: FeedbackAnswerValues,
) {
	return questions.flatMap((q) => {
		const value = values[q.id];
		if (isBlank(value)) return [];
		const answer_text = Array.isArray(value)
			? JSON.stringify(value)
			: (value as string).trim();
		return [{ question_id: q.id, answer_text }];
	});
}
