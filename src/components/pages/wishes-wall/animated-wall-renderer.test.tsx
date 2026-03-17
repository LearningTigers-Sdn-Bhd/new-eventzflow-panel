import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

describe("AnimatedWallRenderer", () => {
	test("renders a dedicated animated wall stage", () => {
		const content = readFileSync(
			new URL("./animated-wall-renderer.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain('data-testid="animated-wall-renderer"');
		expect(content).toContain("data-density");
		expect(content).toContain("AnimatedWishNode");
		expect(content).toContain("normalized.style.accentColor");
		expect(content).not.toContain("backgroundColor: normalized.style.cardBackgroundColor");
		expect(content).not.toContain("color: normalized.style.cardTextColor");
		expect(content).toContain("rgba(255, 248, 240, 0.92)");
		expect(content).toContain("placeholderColor={nodePlaceholderColor}");
		expect(content).toContain("textColor={nodeTextColor}");
		expect(content).not.toContain("backgroundImage:");
	});

	test("renders placeholder and guest node colors from normalized style props", async () => {
		const { AnimatedWishNode } = await import("./animated-wish-node");

		const placeholderHtml = renderToStaticMarkup(
			<AnimatedWishNode
				label="Blessing"
				target={{ x: 50, y: 50 }}
				isPlaceholder
				textColor="#111111"
				placeholderColor="#AA774499"
			/>,
		);
		const guestHtml = renderToStaticMarkup(
			<AnimatedWishNode
				label="Aisyah"
				target={{ x: 50, y: 50 }}
				textColor="#D4A373"
				placeholderColor="#AA774499"
			/>,
		);

		expect(placeholderHtml).toContain("#AA774499");
		expect(guestHtml).toContain("#D4A373");
		expect(guestHtml).toContain("text-shadow:0 1px 2px rgba(255,255,255,0.8)");
	});
});
