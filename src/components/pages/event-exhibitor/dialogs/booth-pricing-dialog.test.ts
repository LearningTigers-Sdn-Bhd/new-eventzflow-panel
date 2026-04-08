import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("BoothPricingDialog conferences column", () => {
	test("labels the boolean field as Conferences with Included/Not included values", () => {
		const content = readFileSync(
			new URL("./booth-pricing-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("<TableHead>Conferences</TableHead>");
		expect(content).toContain('>Included<');
		expect(content).toContain('>Not included<');
		expect(content).not.toContain("<TableHead>Package</TableHead>");
		expect(content).not.toContain("Conference passes included");
	});
});
