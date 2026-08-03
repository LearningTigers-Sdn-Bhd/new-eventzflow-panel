import { describe, expect, mock, test } from "bun:test";

const storeState = {
	sessionCredentials: null as {
		accessToken: string;
		expiresAt: number;
		lastRefreshAt: number;
	} | null,
	isTokenExpiringSoon: () =>
		storeState.sessionCredentials
			? storeState.sessionCredentials.expiresAt - Date.now() <= 2 * 60 * 1000
			: true,
};

let rehydrateHandler: () => Promise<void> = async () => {};

mock.module("@/stores/new-auth-store", () => ({
	useUserSessionStore: {
		getState: () => storeState,
		persist: {
			rehydrate: () => rehydrateHandler(),
			onFinishHydration: () => () => {},
			hasHydrated: () => true,
		},
	},
}));

mock.module("next/navigation", () => ({
	usePathname: () => "/dashboard",
}));

mock.module("@/lib/api/auth", () => ({
	logout: async () => {},
	refreshToken: async () => "token",
}));

describe("AuthProvider storage sync", () => {
	test("rehydrates persisted state before deciding whether to refresh", async () => {
		const { handleAuthStorageChangeForAuthProvider } = await import(
			"./auth-provider"
		);

		const calls: string[] = [];
		storeState.sessionCredentials = {
			accessToken: "stale-token",
			expiresAt: Date.now() + 30_000,
			lastRefreshAt: Date.now() - 60_000,
		};
		rehydrateHandler = async () => {
			calls.push("rehydrate");
			storeState.sessionCredentials = {
				accessToken: "fresh-token",
				expiresAt: Date.now() + 10 * 60_000,
				lastRefreshAt: Date.now(),
			};
		};

		await handleAuthStorageChangeForAuthProvider(
			{ key: "user-session", newValue: "updated" } as StorageEvent,
			{ current: false },
			async () => {
				calls.push("refresh");
			},
		);

		expect(calls).toEqual(["rehydrate"]);
	});
});
