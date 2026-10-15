import { expect, test } from "bun:test";

test("public people counter screen", () => {
	// Other suites mock React Query globally; run these rendering cases in isolation.
	const result = Bun.spawnSync([
		process.execPath,
		"run",
		new URL("./big-screen.test-cases.tsx", import.meta.url).pathname,
	]);
	expect(result.stderr.toString()).toBe("");
	expect(result.exitCode).toBe(0);
});
