import { describe, expect, mock, test } from "bun:test";

const requests: string[] = [];

mock.module("@/utils/rest-api", () => ({
	publicRestClient: { get: async () => ({}) },
	restClient: {
		get: async (url: string) => {
			requests.push(url);
			return {
				currentEvent: { id: 42, title: "Test Event" },
				events: [{ id: 42, title: "Test Event" }],
				permissions: { isEventAdmin: true },
			};
		},
	},
}));

describe("event sidebar context API", () => {
	test("loads the combined lightweight context in one request", async () => {
		requests.length = 0;
		const eventApi = (await import("./endpoints")) as Record<string, unknown>;

		expect(typeof eventApi.getEventSidebarContext).toBe("function");
		const getEventSidebarContext = eventApi.getEventSidebarContext as (
			eventId: string,
		) => Promise<Record<string, unknown>>;
		const result = await getEventSidebarContext("42");

		expect(requests).toEqual(["v1/events/42/sidebar_context"]);
		expect(result).toMatchObject({
			currentEvent: { id: 42 },
			permissions: { isEventAdmin: true },
		});
	});
});
