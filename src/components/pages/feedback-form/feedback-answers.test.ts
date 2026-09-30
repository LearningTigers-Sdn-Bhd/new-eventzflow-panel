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

	test("evaluates sequential page navigation by default", () => {
		const p1q = { ...q(1, "text"), page_number: 1 };
		const p2q = { ...q(2, "text"), page_number: 2 };
		expect(
			evaluatePageNavigation(1, [p1q], {}, [1, 2, 3]),
		).toEqual({ action: "page", targetPage: 2 });
		expect(
			evaluatePageNavigation(2, [p2q], {}, [1, 2, 3]),
		).toEqual({ action: "page", targetPage: 3 });
		expect(
			evaluatePageNavigation(3, [], {}, [1, 2, 3]),
		).toEqual({ action: "submit" });
	});

	test("evaluates conditional jump to target page or submit", () => {
		const branchQ: FeedbackQuestion = {
			...q(1, "single_choice", true),
			page_number: 1,
			options: ["Yes", "No"],
			routing_rules: [
				{ answer: "No", action: "jump_to_page", target_page: 3 },
				{ answer: "Skip All", action: "submit" },
			],
		};
		expect(
			evaluatePageNavigation(1, [branchQ], { 1: "No" }, [1, 2, 3]),
		).toEqual({ action: "page", targetPage: 3 });
		expect(
			evaluatePageNavigation(1, [branchQ], { 1: "Skip All" }, [1, 2, 3]),
		).toEqual({ action: "submit" });
		// When answer is "Yes", falls through to default next page 2
		expect(
			evaluatePageNavigation(1, [branchQ], { 1: "Yes" }, [1, 2, 3]),
		).toEqual({ action: "page", targetPage: 2 });
	});

	test("finds reachable questions excluding bypassed pages", () => {
		const q1: FeedbackQuestion = {
			...q(1, "single_choice", true),
			page_number: 1,
			options: ["Yes", "No"],
			routing_rules: [{ answer: "No", action: "jump_to_page", target_page: 3 }],
		};
		const q2: FeedbackQuestion = { ...q(2, "text", true), page_number: 2 };
		const q3: FeedbackQuestion = { ...q(3, "text", true), page_number: 3 };

		const allQuestions = [q1, q2, q3];

		// If user chose "No", page 2 is skipped: reachable are q1 and q3
		const skippedReachable = findReachableQuestions(allQuestions, { 1: "No" });
		expect(skippedReachable.map((x) => x.id)).toEqual([1, 3]);

		// If user chose "Yes", all questions are reachable
		const fullReachable = findReachableQuestions(allQuestions, { 1: "Yes" });
		expect(fullReachable.map((x) => x.id)).toEqual([1, 2, 3]);
	});

	test("skips alternative branch page 4 when entering page 3", () => {
		const q1: FeedbackQuestion = {
			...q(1, "single_choice", true),
			page_number: 1,
			options: ["Option A", "Option B"],
			routing_rules: [
				{ answer: "Option A", action: "jump_to_page", target_page: 3 },
				{ answer: "Option B", action: "jump_to_page", target_page: 4 },
			],
		};
		const q3 = { ...q(3, "text", true), page_number: 3 };
		const q4 = { ...q(4, "text", true), page_number: 4 };
		const allQuestions = [q1, q3, q4];
		const allPages = [1, 2, 3, 4];

		// From page 1, Option A goes to page 3
		expect(
			evaluatePageNavigation(1, [q1], { 1: "Option A" }, allPages, allQuestions),
		).toEqual({ action: "page", targetPage: 3 });

		// From page 3, because user chose Option A (not Option B), page 4 is skipped and form submits!
		expect(
			evaluatePageNavigation(3, [q3], { 1: "Option A", 3: "Done" }, allPages, allQuestions),
		).toEqual({ action: "submit" });

		// If there is a common page 5 after the branches, it goes to page 5 instead of page 4
		const q5 = { ...q(5, "text", true), page_number: 5 };
		const allQuestionsWith5 = [q1, q3, q4, q5];
		const allPagesWith5 = [1, 2, 3, 4, 5];
		expect(
			evaluatePageNavigation(3, [q3], { 1: "Option A", 3: "Done" }, allPagesWith5, allQuestionsWith5),
		).toEqual({ action: "page", targetPage: 5 });

		// If user chose Option B, from page 1 it goes directly to page 4
		expect(
			evaluatePageNavigation(1, [q1], { 1: "Option B" }, allPages, allQuestions),
		).toEqual({ action: "page", targetPage: 4 });
	});
});
