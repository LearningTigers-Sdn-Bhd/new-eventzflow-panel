import { describe, expect, test } from "bun:test";
import { prepareTtsText } from "./pronunciation";

describe("prepareTtsText", () => {
	test("expands Vitales with ta syllable only", () => {
		expect(prepareTtsText("Vitales")).toBe("vee ta les");
	});
});
