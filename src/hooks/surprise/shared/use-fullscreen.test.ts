import { expect, test } from "bun:test";
import { toggleBrowserFullscreen } from "./use-fullscreen";

test("enters and exits native fullscreen", async () => {
	let active = false;
	const doc = {
		get fullscreenElement() {
			return active ? {} : null;
		},
		documentElement: {
			requestFullscreen: async () => {
				active = true;
			},
		},
		exitFullscreen: async () => {
			active = false;
		},
	} as unknown as Document;
	await toggleBrowserFullscreen(doc);
	expect(active).toBe(true);
	await toggleBrowserFullscreen(doc);
	expect(active).toBe(false);
});

test("supports Safari's prefixed fullscreen API", async () => {
	let active = false;
	const doc = {
		get webkitFullscreenElement() {
			return active ? {} : null;
		},
		documentElement: {
			webkitRequestFullscreen: () => {
				active = true;
			},
		},
		webkitExitFullscreen: () => {
			active = false;
		},
	} as unknown as Document;
	await toggleBrowserFullscreen(doc);
	expect(active).toBe(true);
	await toggleBrowserFullscreen(doc);
	expect(active).toBe(false);
});

test("reports unsupported or blocked fullscreen instead of silently failing", async () => {
	await expect(
		toggleBrowserFullscreen({ documentElement: {} } as Document),
	).rejects.toThrow("Open this display in Chrome or Safari");
	await expect(
		toggleBrowserFullscreen({
			fullscreenEnabled: false,
			documentElement: { requestFullscreen: async () => {} },
		} as unknown as Document),
	).rejects.toThrow("Open this display in a separate browser window");
});
