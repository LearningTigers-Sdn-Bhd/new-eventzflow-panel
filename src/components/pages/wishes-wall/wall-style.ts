import type { WishWallSetting } from "@/lib/api/event/response";
import { API_BASE_URL } from "@/utils/rest-api";

export type NormalizedWallStyle = {
	accentColor: string;
	headerTextColor: string;
	cardBackgroundColor: string;
	cardTextColor: string;
	backgroundImageUrl: string | null;
	wallOverlay: string | null;
};

export const DEFAULT_ACCENT_COLOR = "#D4A373";
export const DEFAULT_HEADER_TEXT_COLOR = "#2F241F";
export const DEFAULT_CARD_BACKGROUND_COLOR = "#FFF7ED";
const DEFAULT_CARD_TEXT_COLOR = "#2F241F";
const LIGHT_CARD_TEXT_COLOR = "#F9FAFB";
const IMAGE_WALL_OVERLAY =
	"linear-gradient(180deg, rgba(255, 247, 237, 0.72) 0%, rgba(255, 251, 245, 0.6) 100%)";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function normalizeColor(value: string | null | undefined, fallback: string) {
	const normalized = value?.trim();
	return normalized && HEX_COLOR_PATTERN.test(normalized)
		? normalized.toUpperCase()
		: fallback;
}

function normalizeBackgroundImageUrl(value: string | null | undefined) {
	const normalized = value?.trim();
	if (!normalized) return null;

	if (
		normalized.startsWith("http://") ||
		normalized.startsWith("https://") ||
		normalized.startsWith("blob:") ||
		normalized.startsWith("data:")
	) {
		return normalized;
	}

	const cleanPath = normalized.startsWith("/") ? normalized.slice(1) : normalized;
	return `${API_BASE_URL}/${cleanPath}`;
}

function expandHexColor(color: string) {
	const hex = color.slice(1, 7);

	if (hex.length === 3) {
		return hex
			.split("")
			.map((char) => `${char}${char}`)
			.join("");
	}

	return hex;
}

function getHexChannelValue(hex: string, start: number) {
	return Number.parseInt(hex.slice(start, start + 2), 16);
}

function getRelativeLuminance(channel: number) {
	const normalized = channel / 255;
	return normalized <= 0.03928
		? normalized / 12.92
		: ((normalized + 0.055) / 1.055) ** 2.4;
}

export function getReadableCardTextColor(cardBackgroundColor: string) {
	const hex = expandHexColor(cardBackgroundColor);
	const red = getRelativeLuminance(getHexChannelValue(hex, 0));
	const green = getRelativeLuminance(getHexChannelValue(hex, 2));
	const blue = getRelativeLuminance(getHexChannelValue(hex, 4));
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

	return luminance > 0.45 ? DEFAULT_CARD_TEXT_COLOR : LIGHT_CARD_TEXT_COLOR;
}

export function normalizeWallStyle(
	setting?: Partial<WishWallSetting> | null,
): NormalizedWallStyle {
	const accentColor = normalizeColor(
		setting?.accent_color,
		DEFAULT_ACCENT_COLOR,
	);
	const headerTextColor = normalizeColor(
		setting?.header_text_color,
		DEFAULT_HEADER_TEXT_COLOR,
	);
	const cardBackgroundColor = normalizeColor(
		setting?.card_background_color,
		DEFAULT_CARD_BACKGROUND_COLOR,
	);
	const backgroundImageUrl = normalizeBackgroundImageUrl(
		setting?.background_image_url,
	);

	return {
		accentColor,
		headerTextColor,
		cardBackgroundColor,
		cardTextColor: getReadableCardTextColor(cardBackgroundColor),
		backgroundImageUrl,
		wallOverlay: backgroundImageUrl ? IMAGE_WALL_OVERLAY : null,
	};
}
