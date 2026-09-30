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

export type PageNavigationResult =
	| { action: "page"; targetPage: number }
	| { action: "submit" };

/**
 * Determine what page to navigate to next from the current page,
 * considering any matching conditional routing rules and skipping
 * alternative branch pages that were not selected.
 */
export function evaluatePageNavigation(
	currentPage: number,
	pageQuestions: FeedbackQuestion[],
	values: FeedbackAnswerValues,
	allPages: number[],
	allQuestions?: FeedbackQuestion[],
): PageNavigationResult {
	const sortedPages = [...new Set(allPages)].sort((a, b) => a - b);

	// 1. Check if any question on the current page has a matching rule
	for (const question of pageQuestions) {
		const rules = question.routing_rules;
		if (!rules || rules.length === 0) continue;

		const rawAnswer = values[question.id];
		if (rawAnswer === undefined || rawAnswer === null) continue;

		const answerStr = Array.isArray(rawAnswer)
			? rawAnswer.join(",")
			: String(rawAnswer).trim();

		const matchingRule = rules.find(
			(r) => r.answer.trim().toLowerCase() === answerStr.toLowerCase(),
		);

		if (matchingRule) {
			if (
				matchingRule.action === "submit" ||
				matchingRule.target_page === null ||
				matchingRule.target_page === undefined ||
				(typeof matchingRule.target_page === "string" &&
					matchingRule.target_page === "submit")
			) {
				return { action: "submit" };
			}
			const target = Number(matchingRule.target_page);
			if (target > currentPage && sortedPages.includes(target)) {
				return { action: "page", targetPage: target };
			}
		}
	}

	// 2. No matching rule on currentPage: look for the next valid page,
	// skipping alternative branch targets from answered questions.
	const questionsToCheck = allQuestions ?? pageQuestions;
	const candidatePages = sortedPages.filter((p) => p > currentPage);

	for (const candidatePage of candidatePages) {
		let isUnselectedBranch = false;

		for (const q of questionsToCheck) {
			const rules = q.routing_rules;
			if (!rules || rules.length === 0) continue;

			// Rules on this question that target candidatePage
			const rulesForCandidate = rules.filter(
				(r) =>
					(r.action === "jump_to_page" || !r.action) &&
					Number(r.target_page) === candidatePage,
			);
			if (rulesForCandidate.length === 0) continue;

			// Has this question been answered?
			const rawAnswer = values[q.id];
			if (rawAnswer === undefined || rawAnswer === null) continue;

			const answerStr = (
				Array.isArray(rawAnswer) ? rawAnswer.join(",") : String(rawAnswer)
			)
				.trim()
				.toLowerCase();

			const userSelectedCandidateRule = rulesForCandidate.some(
				(r) => r.answer.trim().toLowerCase() === answerStr,
			);

			// If the question was answered, but the answer does not lead to candidatePage,
			// candidatePage is an alternative branch that was not chosen.
			if (!userSelectedCandidateRule) {
				isUnselectedBranch = true;
				break;
			}
		}

		if (!isUnselectedBranch) {
			return { action: "page", targetPage: candidatePage };
		}
	}

	return { action: "submit" };
}

/**
 * Find all questions on pages that are reachable based on current answers and routing rules.
 */
export function findReachableQuestions(
	questions: FeedbackQuestion[],
	values: FeedbackAnswerValues,
): FeedbackQuestion[] {
	if (questions.length === 0) return [];

	const allPages = [...new Set(questions.map((q) => q.page_number ?? 1))].sort(
		(a, b) => a - b,
	);
	if (allPages.length === 0) return questions;

	const reachable: FeedbackQuestion[] = [];
	let currentPage: number | null = allPages[0];
	const visitedPages = new Set<number>();

	while (currentPage !== null && !visitedPages.has(currentPage)) {
		visitedPages.add(currentPage);
		const pageQuestions = questions.filter(
			(q) => (q.page_number ?? 1) === currentPage,
		);
		reachable.push(...pageQuestions);

		const nav = evaluatePageNavigation(
			currentPage,
			pageQuestions,
			values,
			allPages,
			questions,
		);
		if (nav.action === "submit") {
			break;
		}
		currentPage = nav.targetPage;
	}

	return reachable;
}
