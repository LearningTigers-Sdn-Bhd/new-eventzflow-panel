import { describe, expect, test } from "bun:test";
import { visitorSearchColumns } from "./event-visitor-search-config";

describe("visitor search config", () => {
	test("supports finding companions by their leader name", () => {
		expect(visitorSearchColumns).toContain("added_by_name");
	});
});
