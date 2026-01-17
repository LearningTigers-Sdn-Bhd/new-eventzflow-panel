import { useMemo } from "react";

/**
 * Generic wrapper background type that works with both LuckyDrawSession and RouletteSession
 */
export interface WrapperBackground {
	useImage: boolean;
	backgroundImgUrl?: string;
	backgroundColor?: string;
}

interface UseSessionBackgroundResult {
	backgroundStyle: React.CSSProperties;
}

/**
 * Hook to calculate background style from wrapper background configuration
 * Works with both lucky-draw and roulette sessions
 */
export function useSessionBackground(
	wrapperBackground: WrapperBackground | null | undefined,
): UseSessionBackgroundResult {
	const backgroundStyle = useMemo<React.CSSProperties>(() => {
		if (!wrapperBackground) return {};

		if (wrapperBackground.useImage && wrapperBackground.backgroundImgUrl) {
			return {
				backgroundImage: `url(${wrapperBackground.backgroundImgUrl})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			};
		}

		if (!wrapperBackground.useImage && wrapperBackground.backgroundColor) {
			return {
				backgroundColor: wrapperBackground.backgroundColor,
			};
		}

		return {};
	}, [wrapperBackground]);

	return { backgroundStyle };
}
