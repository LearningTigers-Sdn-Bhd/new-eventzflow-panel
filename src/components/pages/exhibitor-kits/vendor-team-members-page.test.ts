import { describe, expect, test } from "bun:test";
import {
	buildSingleTeamMemberPayload,
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
});
