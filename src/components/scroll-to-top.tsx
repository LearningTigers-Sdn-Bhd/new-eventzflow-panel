"use client";

import { useEffect } from "react";

/**
 * ScrollToTop component for pages that need consistent scroll behavior
 * Ensures the page always scrolls to top when loaded, regardless of navigation method
 * (browser back button, forward button, direct link, etc.)
 */
export function ScrollToTop() {
	useEffect(() => {
		// Force scroll to top immediately on mount
		window.scrollTo({ top: 0, behavior: "instant" });

		// Clean up hash from URL if present (e.g., #top)
		if (window.location.hash === "#top") {
			window.history.replaceState(
				null,
				"",
				window.location.pathname + window.location.search,
			);
		}
	}, []);

	// This component doesn't render anything
	return null;
}
