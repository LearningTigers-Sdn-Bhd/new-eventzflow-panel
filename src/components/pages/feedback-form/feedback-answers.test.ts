import { describe, expect, test } from "bun:test";
import type { FeedbackQuestion } from "@/lib/api/feedback-form";
import { missingRequired, toAnswerPayload } from "./feedback-answers";

const q = (
	id: number,
	question_type: FeedbackQuestion["question_type"],
	required = false,
): FeedbackQuestion => ({
	id,
	question_text: `Q${id}`,
	question_type,
	options: null,
	required,
	position: id,
});

describe("feedback answers", () => {
	const questions = [
		q(1, "rating", true),
		q(2, "multi_choice", true),
		q(3, "text"),
	];

	test("flags unanswered required questions, including empty multi-choice", () => {
		expect(
			missingRequired(questions, { 1: "4", 2: [] }).map((x) => x.id),
		).toEqual([2]);
		expect(
			missingRequired(questions, { 1: "  ", 2: ["A"] }).map((x) => x.id),
		).toEqual([1]);
	});

	test("handles rating answer with custom scale labels", () => {
		const ratingQ: FeedbackQuestion = {
			...q(4, "rating", true),
			options: ["Terrible", "Poor", "Average", "Good", "Excellent"],
		};
		expect(missingRequired([ratingQ], { 4: "5" })).toHaveLength(0);
		expect(missingRequired([ratingQ], {})).toHaveLength(1);
		expect(toAnswerPayload([ratingQ], { 4: "4" })).toEqual([
			{ question_id: 4, answer_text: "4" },
		]);
	});
});
