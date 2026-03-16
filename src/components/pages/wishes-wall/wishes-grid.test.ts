import { describe, expect, it } from "vitest";
import type { Wish } from "@/lib/api/wishes";
import {
	getRotationPageCount,
	getVisibleWishes,
	mergeIncomingWish,
	normalizeRotationPage,
	WISHES_PER_PAGE,
} from "./wishes-grid-state";

function buildWish(id: number, overrides: Partial<Wish> = {}): Wish {
	return {
		id,
		guest_name: `Guest ${id}`,
		message: `Wish ${id}`,
		status: "approved",
		approved_at: new Date().toISOString(),
		created_at: new Date().toISOString(),
		...overrides,
	};
}

describe("mergeIncomingWish", () => {
	it("keeps all wishes while prepending the newest one", () => {
		const current = Array.from({ length: 6 }, (_, i) => buildWish(i + 1));
		const result = mergeIncomingWish(current, buildWish(99));

		expect(result).toHaveLength(7);
		expect(result[0].id).toBe(99);
	});

	it("does not duplicate an existing wish", () => {
		const current = [buildWish(1), buildWish(2)];
		const result = mergeIncomingWish(
			current,
			buildWish(1, {
				guest_name: "updated",
			}),
		);

		expect(result).toHaveLength(2);
		expect(result[0].guest_name).toBe("updated");
	});

	it("shows eight wishes per page", () => {
		const current = Array.from({ length: 10 }, (_, i) => buildWish(i + 1));
		const result = getVisibleWishes(current, 0);

		expect(WISHES_PER_PAGE).toBe(8);
		expect(result).toHaveLength(8);
		expect(result[0].id).toBe(1);
		expect(result[7].id).toBe(8);
	});

	it("shows the next page when the page index advances", () => {
		const current = Array.from({ length: 10 }, (_, i) => buildWish(i + 1));
		const result = getVisibleWishes(current, 1);

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe(9);
		expect(result[1].id).toBe(10);
	});

	it("wraps page rotation when wishes shrink", () => {
		expect(getRotationPageCount(Array.from({ length: 17 }))).toBe(3);
		expect(normalizeRotationPage(2, Array.from({ length: 7 }))).toBe(0);
		expect(normalizeRotationPage(5, Array.from({ length: 10 }))).toBe(1);
	});
});
