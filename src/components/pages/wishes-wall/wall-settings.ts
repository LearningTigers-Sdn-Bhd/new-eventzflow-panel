import type { WishWallSetting } from "@/lib/api/event/response";
import { type NormalizedWallStyle, normalizeWallStyle } from "./wall-style";

export type NormalizedWallSettings = {
	mode: "cards" | "animation";
	shape: "heart" | "names" | "infinity" | "butterfly";
	text: string | null;
	style: NormalizedWallStyle;
};

const DEFAULT_NAMES_TEXT = "Bride & Groom";

export function isNamesShape(shape: string | null | undefined) {
	return shape === "names";
}

export function resolveAnimationText(
	setting?: Partial<WishWallSetting> | null,
) {
	const value = setting?.animation_text?.trim();
	return value ? value : DEFAULT_NAMES_TEXT;
}

export function normalizeWallSettings(
	setting?: Partial<WishWallSetting> | null,
): NormalizedWallSettings {
	const mode = setting?.display_mode === "animation" ? "animation" : "cards";
	const shape = setting?.animation_shape ?? "heart";

	return {
		mode,
		shape,
		text: isNamesShape(shape) ? resolveAnimationText(setting) : null,
		style: normalizeWallStyle(setting),
	};
}
