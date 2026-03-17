import { describe, expect, it } from "vitest";
import { submitWishSchema } from "./request";

describe("submitWishSchema", () => {
	it("accepts valid wish data", () => {
		const result = submitWishSchema.safeParse({
			guest_name: "Uncle Ahmad",
			message: "Semoga bahagia!",
		});

		expect(result.success).toBe(true);
	});

	it("rejects empty guest name", () => {
		const result = submitWishSchema.safeParse({
			guest_name: "",
			message: "Blessings",
		});

		expect(result.success).toBe(false);
	});

	it("rejects messages longer than 300 chars", () => {
		const result = submitWishSchema.safeParse({
			guest_name: "Test",
			message: "a".repeat(301),
		});

		expect(result.success).toBe(false);
	});

	it("trims whitespace from inputs", () => {
		const result = submitWishSchema.parse({
			guest_name: "  Uncle Ahmad  ",
			message: "  Blessings  ",
		});

		expect(result.guest_name).toBe("Uncle Ahmad");
		expect(result.message).toBe("Blessings");
	});
});
