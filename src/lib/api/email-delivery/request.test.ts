import { describe, expect, test } from "bun:test";
import { updateEmailLogSettingsSchema } from "./request";

describe("updateEmailLogSettingsSchema", () => {
	test("accepts a valid window", () => {
		const result = updateEmailLogSettingsSchema.safeParse({
			retentionDays: 365,
			protectedRetentionDays: 730,
		});
		expect(result.success).toBe(true);
	});

	test("rejects fewer than 30 days with a readable message", () => {
		const result = updateEmailLogSettingsSchema.safeParse({
			retentionDays: 10,
			protectedRetentionDays: 730,
		});
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe("Minimum is 30 days");
	});

	test("rejects a protected window shorter than the normal one", () => {
		const result = updateEmailLogSettingsSchema.safeParse({
			retentionDays: 365,
			protectedRetentionDays: 200,
		});
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.path).toEqual(["protectedRetentionDays"]);
	});
});
