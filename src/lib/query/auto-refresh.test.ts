import { describe, expect, test } from "bun:test";
import {
	DEFAULT_AUTO_REFRESH_INTERVAL_MS,
	getAutoRefreshQueryOptions,
} from "./auto-refresh";

describe("getAutoRefreshQueryOptions", () => {
	test("returns the default interval and disables background polling", () => {
		expect(DEFAULT_AUTO_REFRESH_INTERVAL_MS).toBe(5_000);
		expect(getAutoRefreshQueryOptions()).toEqual({
			refetchInterval: 5_000,
			refetchIntervalInBackground: false,
		});
	});

	test("allows overriding the interval", () => {
		expect(getAutoRefreshQueryOptions(10_000)).toEqual({
			refetchInterval: 10_000,
			refetchIntervalInBackground: false,
		});
	});
});
