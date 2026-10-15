import { describe, expect, test } from "bun:test";
import {
	buildTeamMemberPayload,
	getInvalidActiveMemberIndexes,
	getVisibleTeamMemberSections,
	hasConfiguredTeamMemberLimit,
	normalizeTeamMemberInput,
	resolveCurrentVendor,
	shouldSyncTeamMembers,
} from "./manage-team-members-form";

describe("manage team members helpers", () => {
	test("normalizes null contact fields from legacy team members", () => {
		const normalized = normalizeTeamMemberInput({
			id: 1,
			full_name: "Legacy Member",
			email: null,
			phone: null,
			_destroy: false,
		});

		expect(normalized).toEqual({
			id: 1,
			full_name: "Legacy Member",
			email: "",
			phone: "",
			_destroy: false,
		});
	});

	test("builds deletion payload without crashing on legacy null contacts", () => {
		const payload = buildTeamMemberPayload([
			{
				id: 2,
				full_name: "Legacy Member",
				email: null,
				phone: null,
				_destroy: true,
			},
		]);

		expect(payload).toEqual([
			{
				id: 2,
				full_name: "Legacy Member",
				email: "",
				phone: "",
				_destroy: true,
			},
		]);
	});

	test("prefers freshly fetched vendor data over stale dialog props", () => {
		const initialVendor = {
			id: 10,
			event_id: 99,
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [],
				},
			],
		};

		const freshVendor = {
			id: 10,
			event_id: 99,
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [
						{
							id: 1,
							full_name: "Ali Ahmad",
							email: "ali@example.com",
							phone: "+60123456789",
						},
					],
				},
			],
		};

		expect(resolveCurrentVendor(initialVendor, 5, [freshVendor])).toEqual(
			freshVendor,
		);
	});

	test("keeps initial team members when refetched vendor omits them", () => {
		const initialVendor = {
			id: 10,
			event_id: 99,
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [
						{
							id: 1,
							full_name: "Ali Ahmad",
							email: "ali@example.com",
							phone: "+60123456789",
						},
					],
				},
			],
		};

		const thinVendor = {
			id: 10,
			event_id: 99,
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [],
				},
			],
		};

		expect(resolveCurrentVendor(initialVendor, 5, [thinVendor])).toEqual(
			initialVendor,
		);
	});

	test("trusts newer refetched vendor when team members are legitimately empty", () => {
		const initialVendor = {
			id: 10,
			event_id: 99,
			updated_at: "2026-03-12T10:00:00Z",
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [
						{
							id: 1,
							full_name: "Ali Ahmad",
							email: "ali@example.com",
							phone: "+60123456789",
						},
					],
				},
			],
		};

		const freshVendor = {
			id: 10,
			event_id: 99,
			updated_at: "2026-03-12T10:05:00Z",
			exhibitor_kits: [
				{
					id: 5,
					exhibitor_team_members: [],
				},
			],
		};

		expect(resolveCurrentVendor(initialVendor, 5, [freshVendor])).toEqual(
			freshVendor,
		);
	});

	test("groups free and paid members from visible members after deletions", () => {
		const sections = getVisibleTeamMemberSections(
			[
				{
					id: 1,
					full_name: "Removed",
					email: "r@example.com",
					phone: "1",
					_destroy: true,
				},
				{ id: 2, full_name: "Free A", email: "a@example.com", phone: "2" },
				{ id: 3, full_name: "Free B", email: "b@example.com", phone: "3" },
				{ id: 4, full_name: "Paid C", email: "c@example.com", phone: "4" },
			],
			2,
		);

		expect(sections.visibleMembers.map((member) => member.full_name)).toEqual([
			"Free A",
			"Free B",
			"Paid C",
		]);
		expect(sections.freeMembers.map((entry) => entry.member.full_name)).toEqual(
			["Free A", "Free B"],
		);
		expect(sections.paidMembers.map((entry) => entry.member.full_name)).toEqual(
			["Paid C"],
		);
		expect(sections.paidMembers[0]?.displayIndex).toBe(3);
	});

	test("returns indexes for active members missing a name (email/phone optional)", () => {
		expect(
			getInvalidActiveMemberIndexes([
				{ full_name: "Valid", email: "valid@example.com", phone: "1" },
				{ full_name: "", email: "no-name@example.com", phone: "2" },
				{ full_name: "", email: "", phone: "", _destroy: true },
				{ full_name: "No Contact Info", email: "", phone: "" },
			]),
		).toEqual([1]);
	});

	test("does not sync incoming server members over dirty local edits", () => {
		expect(
			shouldSyncTeamMembers({
				isDirty: true,
				currentMembers: [
					{ full_name: "Draft", email: "draft@example.com", phone: "1" },
				],
				incomingMembers: [
					{ full_name: "Server", email: "server@example.com", phone: "2" },
				],
			}),
		).toBe(false);
	});

	test("treats zero as a configured team member limit", () => {
		expect(hasConfiguredTeamMemberLimit(0)).toBe(true);
		expect(hasConfiguredTeamMemberLimit(null)).toBe(false);
		expect(hasConfiguredTeamMemberLimit(undefined)).toBe(false);
	});
});
