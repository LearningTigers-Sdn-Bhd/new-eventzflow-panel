import { describe, expect, test } from "bun:test";
import {
	ATTENDING_ALONE_LABEL,
	BRINGING_FAMILY_MEMBER_LABEL,
} from "./companion-question-copy";

describe("companion question copy", () => {
	test("uses wedding-friendly label for bringing companions", () => {
		expect(BRINGING_FAMILY_MEMBER_LABEL).toBe(
			"Yes, I'm bringing my family member",
		);
	});

	test("uses wedding-friendly solo attendance label", () => {
		expect(ATTENDING_ALONE_LABEL).toBe("I'll be attending alone");
	});
});
