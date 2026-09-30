import { describe, expect, test } from "bun:test";
import type { FeedbackQuestion } from "@/lib/api/feedback-form";
import {
	evaluatePageNavigation,
	findDuplicateOptions,
	findReachableQuestions,
	findVisiblePages,
	missingRequired,
	pruneRulesToOptions,
	renameRuleAnswer,
	toAnswerPayload,
} from "./feedback-answers";

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
		expect(evaluatePageNavigation(1, [p1q], {}, [1, 2, 3])).toEqual({
			action: "page",
			targetPage: 2,
		});
		expect(evaluatePageNavigation(2, [p2q], {}, [1, 2, 3])).toEqual({
			action: "page",
			targetPage: 3,
		});
		expect(evaluatePageNavigation(3, [], {}, [1, 2, 3])).toEqual({
			action: "submit",
		});
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
			evaluatePageNavigation(
				1,
				[q1],
				{ 1: "Option A" },
				allPages,
				allQuestions,
			),
		).toEqual({ action: "page", targetPage: 3 });

		// From page 3, because user chose Option A (not Option B), page 4 is skipped and form submits!
		expect(
			evaluatePageNavigation(
				3,
				[q3],
				{ 1: "Option A", 3: "Done" },
				allPages,
				allQuestions,
			),
		).toEqual({ action: "submit" });

		// If there is a common page 5 after the branches, it goes to page 5 instead of page 4
		const q5 = { ...q(5, "text", true), page_number: 5 };
		const allQuestionsWith5 = [q1, q3, q4, q5];
		const allPagesWith5 = [1, 2, 3, 4, 5];
		expect(
			evaluatePageNavigation(
				3,
				[q3],
				{ 1: "Option A", 3: "Done" },
				allPagesWith5,
				allQuestionsWith5,
			),
		).toEqual({ action: "page", targetPage: 5 });

		// If user chose Option B, from page 1 it goes directly to page 4
		expect(
			evaluatePageNavigation(
				1,
				[q1],
				{ 1: "Option B" },
				allPages,
				allQuestions,
			),
		).toEqual({ action: "page", targetPage: 4 });
	});

	test("single-page mode hides branch sections until a choice is made", () => {
		const q1: FeedbackQuestion = {
			...q(1, "single_choice", true),
			page_number: 1,
			options: ["Option 1", "Option 2"],
			routing_rules: [
				{ answer: "Option 1", action: "jump_to_page", target_page: 2 },
				{ answer: "Option 2", action: "jump_to_page", target_page: 3 },
			],
		};
		const q2: FeedbackQuestion = { ...q(2, "text", false), page_number: 2 };
		const q3: FeedbackQuestion = { ...q(3, "text", false), page_number: 3 };
		const all = [q1, q2, q3];

		expect(findVisiblePages(all, {})).toEqual([1]);
		expect(findVisiblePages(all, { 1: "Option 1" })).toEqual([1, 2]);
		expect(findVisiblePages(all, { 1: "Option 2" })).toEqual([1, 3]);
	});

	describe("edge cases", () => {
		const choice = (
			id: number,
			page: number,
			rules: FeedbackQuestion["routing_rules"],
			required = true,
		): FeedbackQuestion => ({
			...q(id, "single_choice", required),
			page_number: page,
			options: ["Yes", "No", "A", "B"],
			routing_rules: rules,
		});
		const text = (id: number, page: number): FeedbackQuestion => ({
			...q(id, "text", true),
			page_number: page,
		});

		test("'If No, skip to page 4' still shows page 4 to people who said Yes", () => {
			const all = [
				choice(1, 1, [
					{ answer: "No", action: "jump_to_page", target_page: 4 },
				]),
				text(2, 2),
				text(3, 3),
				text(4, 4),
			];
			const pages = [1, 2, 3, 4];
			// Yes walks 1 -> 2 -> 3 -> 4
			expect(
				evaluatePageNavigation(3, [all[2]], { 1: "Yes" }, pages, all),
			).toEqual({ action: "page", targetPage: 4 });
			expect(
				findReachableQuestions(all, { 1: "Yes" }).map((x) => x.id),
			).toEqual([1, 2, 3, 4]);
		});

		test("branches that rejoin: both tracks reach the shared last page", () => {
			const all = [
				choice(1, 1, [
					{ answer: "A", action: "jump_to_page", target_page: 2 },
					{ answer: "B", action: "jump_to_page", target_page: 3 },
				]),
				text(2, 2),
				text(3, 3),
				text(4, 4),
			];
			expect(findReachableQuestions(all, { 1: "A" }).map((x) => x.id)).toEqual([
				1, 2, 4,
			]);
			expect(findReachableQuestions(all, { 1: "B" }).map((x) => x.id)).toEqual([
				1, 3, 4,
			]);
		});

		test("rule that jumps backwards is ignored, not looped", () => {
			const all = [
				text(1, 1),
				choice(2, 2, [{ answer: "A", action: "jump_to_page", target_page: 1 }]),
				text(3, 3),
			];
			expect(findReachableQuestions(all, { 2: "A" }).map((x) => x.id)).toEqual([
				1, 2, 3,
			]);
		});

		test("rule targeting a page that no longer exists falls back to next page", () => {
			const all = [
				choice(1, 1, [{ answer: "A", action: "jump_to_page", target_page: 9 }]),
				text(2, 2),
			];
			expect(findReachableQuestions(all, { 1: "A" }).map((x) => x.id)).toEqual([
				1, 2,
			]);
		});

		test("rule answer matches ignoring case and whitespace", () => {
			const all = [
				choice(1, 1, [
					{ answer: "  yes ", action: "submit", target_page: null },
				]),
				text(2, 2),
			];
			expect(
				findReachableQuestions(all, { 1: "Yes" }).map((x) => x.id),
			).toEqual([1]);
		});

		test("single-page mode: optional branching question left blank strands later sections", () => {
			const all = [
				choice(
					1,
					1,
					[{ answer: "A", action: "jump_to_page", target_page: 3 }],
					false,
				),
				text(2, 2),
				text(3, 3),
			];
			// Sections 2 and 3 stay hidden until a choice is made; there is no way
			// to reach them by leaving it blank.
			expect(findVisiblePages(all, {})).toEqual([1]);
		});

		test("single-page mode: changing the choice swaps the visible section", () => {
			const all = [
				choice(1, 1, [
					{ answer: "A", action: "jump_to_page", target_page: 2 },
					{ answer: "B", action: "jump_to_page", target_page: 3 },
				]),
				text(2, 2),
				text(3, 3),
			];
			expect(findVisiblePages(all, { 1: "A" })).toEqual([1, 2]);
			expect(findVisiblePages(all, { 1: "B" })).toEqual([1, 3]);
		});

		test("two branching questions on one page use the first matching rule", () => {
			const all = [
				choice(1, 1, [{ answer: "A", action: "jump_to_page", target_page: 2 }]),
				choice(2, 1, [{ answer: "A", action: "submit", target_page: null }]),
				text(3, 2),
			];
			expect(
				findReachableQuestions(all, { 1: "A", 2: "A" }).map((x) => x.id),
			).toEqual([1, 2, 3]);
		});
	});

	describe("editing options", () => {
		const rules = [
			{ answer: "Option 1", action: "jump_to_page" as const, target_page: 3 },
			{ answer: "Option 2", action: "jump_to_page" as const, target_page: 4 },
		];

		test("renaming an option moves its rule with it", () => {
			expect(renameRuleAnswer(rules, "Option 1", "Beach")).toEqual([
				{ answer: "Beach", action: "jump_to_page", target_page: 3 },
				rules[1],
			]);
		});

		test("rename is a no-op when nothing changed or a side is blank", () => {
			expect(renameRuleAnswer(rules, "Option 1", "Option 1")).toBe(rules);
			expect(renameRuleAnswer(rules, "Option 1", "")).toBe(rules);
			expect(renameRuleAnswer(rules, "", "x")).toBe(rules);
		});

		test("rules for removed options are pruned, case-insensitively", () => {
			expect(pruneRulesToOptions(rules, ["option 2", "Other"])).toEqual([
				rules[1],
			]);
		});

		test("finds duplicates ignoring case and spaces, skipping blanks", () => {
			expect(findDuplicateOptions(["Yes", "yes ", "No", "", ""])).toEqual([
				"yes",
			]);
			expect(findDuplicateOptions(["A", "B"])).toEqual([]);
		});
	});
});
