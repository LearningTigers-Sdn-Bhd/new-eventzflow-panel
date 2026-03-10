import { describe, expect, it } from "vitest";
import { mergeIncomingWish } from "./wishes-grid-state";

describe("mergeIncomingWish", () => {
	it("keeps only the latest six wishes", () => {
		const current = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 })) as any;
		const result = mergeIncomingWish(current, { id: 99 } as any);

		expect(result).toHaveLength(6);
		expect(result[0].id).toBe(99);
	});

	it("does not duplicate an existing wish", () => {
		const current = [{ id: 1 }, { id: 2 }] as any;
		const result = mergeIncomingWish(current, {
			id: 1,
			guest_name: "updated",
		} as any);

		expect(result).toHaveLength(2);
		expect(result[0].guest_name).toBe("updated");
	});
});
