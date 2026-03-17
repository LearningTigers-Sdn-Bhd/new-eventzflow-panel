import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeWallSettings } from "./wall-settings";

mock.module("next/font/google", () => ({
	Great_Vibes: () => ({ className: "great-vibes" }),
}));

describe("WishesWallShell", () => {
	test("renders shared wall background and styled header", async () => {
		const { WishesWallShell } = await import("./wishes-wall-shell");
		const settings = normalizeWallSettings({
			display_mode: "animation",
			accent_color: "#AA7744",
			header_text_color: "#221A14",
			background_image_url: "https://cdn.example.com/wall.webp",
		});

		const html = renderToStaticMarkup(
			<WishesWallShell settings={settings} eventTitle="Aisyah & Faiz">
				<div>Wall Body</div>
			</WishesWallShell>,
		);

		expect(html).toContain("Aisyah &amp; Faiz");
		expect(html).toContain("Blessings &amp; Wishes for");
		expect(html).toContain("Wall Body");
		expect(html).toContain("https://cdn.example.com/wall.webp");
		expect(html).toContain("#221A14");
		expect(html).toContain("#AA7744");
		expect(html).toContain("linear-gradient(180deg");
		expect(html).toContain(
			'<div class="relative min-h-screen overflow-hidden bg-rsvp-canvas px-6 py-12 sm:px-10 lg:px-14">',
		);
		expect(html).toContain(
			'<div class="pointer-events-none fixed inset-0 z-0" style="background-image:linear-gradient',
		);
	});

	test("uses absolute background layer for preview mode", async () => {
		const { WishesWallShell } = await import("./wishes-wall-shell");
		const settings = normalizeWallSettings({
			display_mode: "cards",
			background_image_url: "https://cdn.example.com/wall.webp",
		});

		const html = renderToStaticMarkup(
			<WishesWallShell settings={settings} eventTitle="Preview" preview>
				<div>Wall Body</div>
			</WishesWallShell>,
		);

		expect(html).toContain(
			'<div class="pointer-events-none absolute inset-0 z-0" style="background-image:linear-gradient',
		);
	});

	test("does not apply a default overlay when no custom background image exists", async () => {
		const { WishesWallShell } = await import("./wishes-wall-shell");
		const settings = normalizeWallSettings({
			display_mode: "cards",
		});

		const html = renderToStaticMarkup(
			<WishesWallShell settings={settings} eventTitle="Wedding Reception">
				<div>Wall Body</div>
			</WishesWallShell>,
		);

		expect(html).not.toContain("linear-gradient(180deg");
		expect(html).not.toContain("background:");
	});
});
