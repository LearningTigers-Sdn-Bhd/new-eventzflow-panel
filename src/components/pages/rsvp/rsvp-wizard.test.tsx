import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("RsvpWizard assets", () => {
	test("uses webp flower assets for RSVP decorations", () => {
		const content = readFileSync(
			new URL("./rsvp-wizard.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain('import Image from "next/image"');
		expect(content).toContain("/images/assets/flowers/top-left-flower.webp");
		expect(content).toContain("/images/assets/flowers/top-right-flower.webp");
		expect(content).toContain("/images/assets/flowers/bottom-left-flower.webp");
		expect(content).toContain(
			"/images/assets/flowers/bottom-right-flower.webp",
		);
		expect(content).toContain(
			'src="/images/assets/flowers/top-right-flower.webp"',
		);
		expect(content).toContain('loading="eager"');
		expect(content).not.toContain(".png");
		expect(content).not.toContain("<img");
	});
});
