import { expect, test } from "bun:test";
import { safeRedirect } from "./safe-redirect";

test("keeps same-site paths", () => {
	expect(safeRedirect("/dashboard")).toBe("/dashboard");
	expect(safeRedirect("/invite/host/abc?x=1&y=2#top")).toBe(
		"/invite/host/abc?x=1&y=2#top",
	);
});

test("rejects anything that can leave the site", () => {
	for (const bad of [
		"//evil.com",
		"/\\evil.com",
		"https://evil.com",
		"http://evil.com/a",
		"javascript:alert(1)",
		"evil.com",
		"/\t/evil.com",
		"/\n/evil.com",
		"",
		null,
		undefined,
	]) {
		expect(safeRedirect(bad)).toBeNull();
	}
});
