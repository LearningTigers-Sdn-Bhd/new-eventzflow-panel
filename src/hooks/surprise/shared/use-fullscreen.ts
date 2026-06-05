"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook to manage browser fullscreen state
 * @returns {isFullscreen: boolean, toggleFullscreen: () => Promise<void>}
 */
export function useFullscreen() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggleFullscreen = useCallback(async () => {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else if (document.exitFullscreen) {
				await document.exitFullscreen();
			}
		} catch (error) {
			console.error("Error attempting to toggle fullscreen:", error);
		}
	}, []);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		// For cross-browser compatibility
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
		document.addEventListener("mozfullscreenchange", handleFullscreenChange);
		document.addEventListener("MSFullscreenChange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange,
			);
			document.removeEventListener(
				"mozfullscreenchange",
				handleFullscreenChange,
			);
			document.removeEventListener(
				"MSFullscreenChange",
				handleFullscreenChange,
			);
		};
	}, []);

	return { isFullscreen, toggleFullscreen };
}
