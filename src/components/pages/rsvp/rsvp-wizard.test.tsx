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

	test("wires the guestbook blessing link from confirmation step", () => {
		const wizardContent = readFileSync(
			new URL("./rsvp-wizard.tsx", import.meta.url),
			"utf8",
		);
		const confirmationContent = readFileSync(
			new URL("./steps/confirmation-step.tsx", import.meta.url),
			"utf8",
		);

		expect(wizardContent).toContain("eventSlug={slug}");
		expect(wizardContent).toContain("visitorPublicId={publicId}");
		expect(confirmationContent).toContain("Write a Blessing");
		expect(confirmationContent).toContain("/guestbook?visitor=");
	});
});
