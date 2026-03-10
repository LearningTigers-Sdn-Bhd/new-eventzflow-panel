import { describe, expect, test } from "bun:test";
import {
	appendCompanionDraft,
	createCompanionDrafts,
	removeCompanionDraft,
	updateCompanionDraft,
} from "./companion-drafts";

describe("companion drafts", () => {
	test("keeps the same row id when email and phone change", () => {
		const [draft] = createCompanionDrafts([
			{ full_name: "", phone: "", email: "" },
		]);

		const withEmail = updateCompanionDraft(
			[draft],
			draft.id,
			"email",
			"guest@example.com",
		);
		const withPhone = updateCompanionDraft(
			withEmail,
			draft.id,
			"phone",
			"+1234567890",
		);

		expect(withPhone).toHaveLength(1);
		expect(withPhone[0]?.id).toBe(draft.id);
		expect(withPhone[0]?.email).toBe("guest@example.com");
		expect(withPhone[0]?.phone).toBe("+1234567890");
	});

	test("creates a blank first guest when no companions exist", () => {
		const drafts = createCompanionDrafts([]);

		expect(drafts).toHaveLength(1);
		expect(drafts[0]).toMatchObject({
			full_name: "",
			phone: "",
			email: "",
		});
	});

	test("appends and removes guests without reusing remaining ids", () => {
		const initial = createCompanionDrafts([
			{ full_name: "Alex", phone: "", email: "alex@example.com" },
		]);
		const appended = appendCompanionDraft(initial);
		const firstId = appended[0]?.id;
		const secondId = appended[1]?.id;

		const remaining = removeCompanionDraft(appended, firstId as string);

		expect(secondId).toBeDefined();
		expect(remaining).toHaveLength(1);
		expect(remaining[0]?.id).toBe(secondId);
	});
});
