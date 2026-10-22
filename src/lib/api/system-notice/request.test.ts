import { describe, expect, test } from "bun:test";
import { updateSystemNoticeSchema } from "./request";

describe("updateSystemNoticeSchema", () => {
	test("accepts a message with the banner on", () => {
		expect(
			updateSystemNoticeSchema.parse({
				message: " Update 10 PM ",
				active: true,
			}),
		).toEqual({ message: "Update 10 PM", active: true });
	});

	test("allows an empty message while the banner is off", () => {
		expect(
			updateSystemNoticeSchema.safeParse({ message: "", active: false })
				.success,
		).toBe(true);
	});

	test("rejects switching on without a message", () => {
		const result = updateSystemNoticeSchema.safeParse({
			message: "   ",
			active: true,
		});

		expect(result.success).toBe(false);
	});

	test("rejects a message over 300 characters", () => {
		expect(
			updateSystemNoticeSchema.safeParse({
				message: "a".repeat(301),
				active: false,
			}).success,
		).toBe(false);
	});
});
