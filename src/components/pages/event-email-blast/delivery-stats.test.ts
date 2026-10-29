import { describe, expect, test } from "bun:test";
import { groupDeliveryCounts } from "./delivery-stats";

describe("groupDeliveryCounts", () => {
	test("folds raw statuses into the four groups", () => {
		expect(
			groupDeliveryCounts({
				delivered: 5,
				sent: 2,
				queued: 1,
				sending: 1,
				failed: 1,
				bounced: 2,
				skipped: 9,
			}),
		).toEqual({ delivered: 5, sent: 2, pending: 2, problem: 3 });
	});
});
