import { describe, expect, test } from "bun:test";
import { normalizeWallSettings, resolveAnimationText } from "./wall-settings";

describe("wall settings helpers", () => {
	test("falls back to heart when animation shape is missing", () => {
		expect(normalizeWallSettings({ display_mode: "animation" })).toEqual({
			mode: "animation",
			shape: "heart",
			text: null,
			style: {
				accentColor: "#D4A373",
				headerTextColor: "#2F241F",
				cardBackgroundColor: "#FFF7ED",
				cardTextColor: "#2F241F",
				backgroundImageUrl: null,
				wallOverlay: null,
			},
		});
	});

	test("falls back to Bride & Groom for names text", () => {
		expect(
			resolveAnimationText({
				display_mode: "animation",
				animation_shape: "names",
				animation_text: "",
			}),
		).toBe("Bride & Groom");
	});

	test("normalizes custom style values and keeps names text behavior", () => {
		expect(
			normalizeWallSettings({
				display_mode: "animation",
				animation_shape: "names",
				animation_text: "  Forever Us  ",
				accent_color: "  #AA7744  ",
				header_text_color: "  #221A14 ",
				card_background_color: " #1F2937 ",
				background_image_url: "  https://cdn.example.com/wall.webp  ",
			}),
		).toEqual({
			mode: "animation",
			shape: "names",
			text: "Forever Us",
			style: {
				accentColor: "#AA7744",
				headerTextColor: "#221A14",
				cardBackgroundColor: "#1F2937",
				cardTextColor: "#F9FAFB",
				backgroundImageUrl: "https://cdn.example.com/wall.webp",
				wallOverlay:
					"linear-gradient(180deg, rgba(255, 247, 237, 0.72) 0%, rgba(255, 251, 245, 0.6) 100%)",
			},
		});
	});

	test("prefixes backend relative background image URLs with API base", () => {
		expect(
			normalizeWallSettings({
				display_mode: "cards",
				background_image_url: "/rails/active_storage/blobs/test-image.png",
			}).style.backgroundImageUrl,
		).toBe("http://localhost:3000/rails/active_storage/blobs/test-image.png");
	});

	test("falls back to safe readable style defaults for blank or invalid values", () => {
		expect(
			normalizeWallSettings({
				display_mode: "cards",
				accent_color: "",
				header_text_color: "   ",
				card_background_color: "not-a-color",
				background_image_url: "   ",
			}),
		).toMatchObject({
			mode: "cards",
			shape: "heart",
			text: null,
			style: {
				accentColor: "#D4A373",
				headerTextColor: "#2F241F",
				cardBackgroundColor: "#FFF7ED",
				cardTextColor: "#2F241F",
				backgroundImageUrl: null,
				wallOverlay: null,
			},
		});
	});
});
