import { describe, expect, test } from "bun:test";
import {
	buildSingleTeamMemberPayload,
	getExtraSlotSummary,
	getExtraTeamMemberPaymentFeedback,
	normalizeTeamMemberInput,
} from "./vendor-team-members-page";

describe("vendor team member payload helpers", () => {
	test("normalizes null contact fields from older records", () => {
		const normalized = normalizeTeamMemberInput({
			id: 1,
			full_name: "Legacy Member",
			email: null,
			phone: null,
			created_at: "2026-03-12T10:00:00Z",
		});

		expect(normalized).toEqual({
			id: 1,
			full_name: "Legacy Member",
			email: "",
			phone: "",
			created_at: "2026-03-12T10:00:00Z",
			_destroy: false,
		});
	});

	test("builds removal payload without crashing on legacy nulls", () => {
		const payload = buildSingleTeamMemberPayload({
			id: 2,
			full_name: "Removed Member",
			email: "removed@example.com",
			phone: "+60111111111",
			_destroy: true,
		});

		expect(payload).toEqual([
			{
				id: 2,
				full_name: "Removed Member",
				email: "removed@example.com",
				phone: "+60111111111",
				_destroy: true,
			},
		]);
	});

	test("builds add payload with only the new member", () => {
		const payload = buildSingleTeamMemberPayload({
			full_name: "New Member",
			email: "new@example.com",
			phone: "+60122222222",
			_destroy: false,
		});

		expect(payload).toEqual([
			{
				id: undefined,
				full_name: "New Member",
				email: "new@example.com",
				phone: "+60122222222",
				_destroy: false,
			},
		]);
	});

	test("builds success feedback from redirect params", () => {
		const feedback = getExtraTeamMemberPaymentFeedback(
			new URLSearchParams("payment=success&source=extra-team-member"),
		);

		expect(feedback).toEqual({
			variant: "success",
			title: "Payment successful",
			message: "Your extra team member payment was completed successfully.",
		});
	});

	test("builds error feedback from redirect params", () => {
		const feedback = getExtraTeamMemberPaymentFeedback(
			new URLSearchParams(
				"payment=error&source=extra-team-member&reason=invalid_signature",
			),
		);

		expect(feedback).toEqual({
			variant: "error",
			title: "Payment not completed",
			message: "We could not confirm the payment. Please try again from the pending payment card.",
		});
	});

	test("ignores unrelated search params", () => {
		const feedback = getExtraTeamMemberPaymentFeedback(
			new URLSearchParams("payment=success&source=other"),
		);

		expect(feedback).toBeNull();
	});

	test("builds paid extra slot summary from backend counters", () => {
		const summary = getExtraSlotSummary({
			paid_extra_member_count: 4,
			used_paid_extra_member_count: 3,
		});

		expect(summary).toEqual({
			paid: 4,
			inUse: 3,
			label: "3 / 4 in use",
		});
	});

	test("returns null extra slot summary when no paid slots exist", () => {
		const summary = getExtraSlotSummary({
			paid_extra_member_count: 0,
			used_paid_extra_member_count: 0,
		});

		expect(summary).toBeNull();
	});
});
