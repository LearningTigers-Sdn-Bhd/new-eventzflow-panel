import { useEffect } from "react";

const RELOAD_KEY = "chunk-reload-at";
// Don't reload more than once per window, so a genuinely broken deploy
// can't trap the user in a reload loop.
const RELOAD_COOLDOWN_MS = 30_000;

export function isChunkLoadError(error: Error): boolean {
	return (
		error.name === "ChunkLoadError" ||
		/Loading chunk|Failed to load chunk|Importing a module script failed|dynamically imported module/i.test(
			error.message,
		)
	);
}

/**
 * After an FE redeploy, an old tab references JS chunks that no longer exist.
 * Reload once to pick up the new build. Returns whether the error is one.
 */
export function useChunkErrorReload(error: Error): boolean {
	const isChunkError = isChunkLoadError(error);

	useEffect(() => {
		if (!isChunkError) return;
		try {
			const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
			if (Date.now() - last > RELOAD_COOLDOWN_MS) {
				sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
				window.location.reload();
			}
		} catch {
			// sessionStorage unavailable — the manual reload button still works
		}
	}, [isChunkError]);

	return isChunkError;
}
