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

	test("drops blanks and JSON-encodes multi-choice", () => {
		expect(
			toAnswerPayload(questions, { 1: "5", 2: ["A", "B"], 3: " " }),
		).toEqual([
			{ question_id: 1, answer_text: "5" },
			{ question_id: 2, answer_text: '["A","B"]' },
		]);
	});
});
