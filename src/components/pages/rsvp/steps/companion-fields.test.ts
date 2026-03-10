import { describe, expect, test } from "bun:test";
import { getCompanionFieldMeta } from "./companion-fields";

describe("companion field metadata", () => {
	test("returns autofill-friendly metadata for guest email", () => {
		const field = getCompanionFieldMeta(0, "email");

		expect(field.label).toBe("Email Address");
		expect(field.name).toBe("email");
		expect(field.placeholder).toBe("john.doe@example.com");
		expect(field.autoComplete).toBe("email");
		expect(field.type).toBe("email");
	});

	test("returns example placeholder for guest phone", () => {
		const field = getCompanionFieldMeta(1, "phone");

		expect(field.label).toBe("Phone Number");
		expect(field.name).toBe("phone");
		expect(field.placeholder).toBe("+1 234 567 8900");
		expect(field.autoComplete).toBe("tel");
	});

	test("uses plain email and phone tokens for filler compatibility", () => {
		const emailField = getCompanionFieldMeta(0, "email");
		const phoneField = getCompanionFieldMeta(0, "phone");

		expect(emailField.name).toBe("email");
		expect(emailField.autoComplete).toBe("email");
		expect(phoneField.name).toBe("phone");
		expect(phoneField.autoComplete).toBe("tel");
	});
});
