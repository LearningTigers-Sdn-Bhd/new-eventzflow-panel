import { expect, test } from "bun:test";
import type { InvalidParticipant } from "@/lib/api/lucky-draw/response";
import { filterWinners } from "./winner-search";

const winners: InvalidParticipant[] = [
	{
		id: 1,
		lucky_draw_session_id: 1,
		participant: {
			id: 10,
			name: "Francis Justin Chong",
			contact: "ID 123456",
			ic_passport_no: "010203-12-3456",
			ticket_public_id: "37eedd11-6d6b-4b75-a619-8c087f6352f0",
		},
		gift_taken: "Shopping voucher",
		round: 1,
		voided_at: null,
		created_at: "2026-11-03T00:00:00Z",
		updated_at: "2026-11-03T00:00:00Z",
	},
	{
		id: 2,
		lucky_draw_session_id: 1,
		participant: {
			id: 11,
			name: "Khoo Eng Huei",
			contact: "staff@example.com",
		},
		round: 1,
		voided_at: "2026-11-03T01:00:00Z",
		created_at: "2026-11-03T00:00:00Z",
		updated_at: "2026-11-03T01:00:00Z",
	},
];

test("searches names, identity, contact and gift notes regardless of case or formatting", () => {
	for (const query of [
		"JUSTIN",
		"010203123456",
		"010203-12-3456",
		"37eedd116d6b",
		"voucher",
		"  francis  123456 ",
	]) {
		expect(filterWinners(winners, query).map((winner) => winner.id)).toEqual([
			1,
		]);
	}
});

test("includes voided history and handles missing optional fields", () => {
	expect(filterWinners(winners, "khoo").map((winner) => winner.id)).toEqual([
		2,
	]);
	expect(
		filterWinners(winners, "staff@example.com").map((winner) => winner.id),
	).toEqual([2]);
	expect(filterWinners(winners, "unknown")).toEqual([]);
	expect(filterWinners(winners, "francis khoo")).toEqual([]);
});

test("empty search preserves the full list and its order", () => {
	expect(filterWinners(winners, "   ")).toBe(winners);
	expect(filterWinners(winners, "---")).toBe(winners);
});
