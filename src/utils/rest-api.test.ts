import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let forceRefreshCalls = 0;
let directRefreshCalls = 0;

mock.module("@/services/refresh-queue", () => ({
	refreshQueueService: {
		waitForRefreshIfNeeded: async () => false,
		forceRefresh: async () => {
			forceRefreshCalls += 1;
			return "fresh-token";
		},
	},
}));

mock.module("@/lib/api/auth/endpoints", () => ({
	refreshToken: async () => {
		directRefreshCalls += 1;
		return "direct-token";
	},
}));

mock.module("@/stores/new-auth-store", () => ({
	useUserSessionStore: {
		getState: () => ({
			sessionCredentials: {
				accessToken: "stale-token",
				expiresAt: Date.now() + 60_000,
				lastRefreshAt: Date.now() - 60_000,
			},
			isTokenExpired: () => false,
			removeSessionCredentials: () => {},
			setUser: () => {},
		}),
	},
}));

describe("kyClient 401 recovery", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		forceRefreshCalls = 0;
		directRefreshCalls = 0;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("uses the shared refresh queue and replays the original request once", async () => {
		const urls: string[] = [];
		globalThis.fetch = mock(async (input: RequestInfo | URL) => {
			const url = input instanceof Request ? input.url : input.toString();
			urls.push(url);

			if (urls.length === 1) {
				return new Response(JSON.stringify({ error: "unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		const { restClient } = await import("./rest-api");

		await expect(
			restClient.get<{ ok: boolean }>("v1/protected"),
		).resolves.toEqual({
			ok: true,
		});
		expect(forceRefreshCalls).toBe(1);
		expect(directRefreshCalls).toBe(0);
		expect(urls).toEqual([
			"http://localhost:3000/v1/protected",
			"http://localhost:3000/v1/protected",
		]);
	});

	test("does not retry forever when the replay is also unauthorized", async () => {
		let requestCount = 0;
		globalThis.fetch = mock(async () => {
			requestCount += 1;
			return new Response(JSON.stringify({ error: "unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		const { restClient } = await import("./rest-api");

		await expect(restClient.get("v1/protected-loop")).rejects.toThrow();
		expect(forceRefreshCalls).toBe(1);
		expect(requestCount).toBe(2);
	});
});
