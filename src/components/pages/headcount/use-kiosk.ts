import { useCallback, useEffect, useState } from "react";

const RELOAD_EVERY_MS = 6 * 60 * 60 * 1000;

/** Keeps a TV from sleeping while the page is open; asks again when the tab comes back. */
export function useWakeLock() {
	useEffect(() => {
		let lock: WakeLockSentinel | null = null;
		const request = () => {
			navigator.wakeLock
				?.request("screen")
				.then((l) => {
					lock = l;
				})
				.catch(() => {});
		};
		const onVisible = () => document.visibilityState === "visible" && request();
		request();
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			document.removeEventListener("visibilitychange", onVisible);
			lock?.release().catch(() => {});
		};
	}, []);
}

/** Reloads the page now and then so a screen left on for days picks up new releases. Only when the server answers, so an outage never leaves a blank page. */
export function useAutoReload() {
	useEffect(() => {
		const id = setInterval(() => {
			fetch(window.location.href, { method: "HEAD", cache: "no-store" })
				.then((res) => res.ok && window.location.reload())
				.catch(() => {});
		}, RELOAD_EVERY_MS);
		return () => clearInterval(id);
	}, []);
}

/** Fullscreen toggle; `supported` is false where the browser has no fullscreen (iPhone Safari). */
export function useFullscreen() {
	const [active, setActive] = useState(false);
	const [supported, setSupported] = useState(false);
	useEffect(() => {
		setSupported(document.fullscreenEnabled);
		const sync = () => setActive(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", sync);
		return () => document.removeEventListener("fullscreenchange", sync);
	}, []);
	const toggle = useCallback(() => {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		else document.documentElement.requestFullscreen().catch(() => {});
	}, []);
	return { active, supported, toggle };
}
