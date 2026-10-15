"use client";

import { useCallback, useEffect, useState } from "react";

type FullscreenDocument = Document & {
	webkitFullscreenElement?: Element;
	webkitFullscreenEnabled?: boolean;
	webkitExitFullscreen?: () => void | Promise<void>;
};

export async function toggleBrowserFullscreen(
	document: Document = window.document,
) {
	const doc = document as FullscreenDocument;
	const root = doc.documentElement as HTMLElement & {
		webkitRequestFullscreen?: () => void | Promise<void>;
	};
	if (doc.fullscreenElement) await doc.exitFullscreen();
	else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen)
		await doc.webkitExitFullscreen();
	else {
		if ((doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled) === false) {
			throw new Error(
				"Fullscreen is blocked here. Open this display in a separate browser window.",
			);
		}
		if (root.requestFullscreen) await root.requestFullscreen();
		else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
		else
			throw new Error(
				"Open this display in Chrome or Safari to use fullscreen.",
			);
	}
}

/**
 * Hook to manage browser fullscreen state
 * @returns {isFullscreen: boolean, toggleFullscreen: () => Promise<void>}
 */
export function useFullscreen() {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [fullscreenError, setFullscreenError] = useState("");

	const toggleFullscreen = useCallback(async () => {
		try {
			await toggleBrowserFullscreen();
			setFullscreenError("");
		} catch (error) {
			setFullscreenError(
				error instanceof Error ? error.message : "Unable to enter fullscreen.",
			);
			console.error("Error attempting to toggle fullscreen:", error);
		}
	}, []);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(
				!!(
					document.fullscreenElement ||
					(document as FullscreenDocument).webkitFullscreenElement
				),
			);
		};
		handleFullscreenChange();

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

	return { isFullscreen, toggleFullscreen, fullscreenError };
}
