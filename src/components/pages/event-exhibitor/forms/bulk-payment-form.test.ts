import { expect, test } from "bun:test";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";
import { mapWithConcurrency, resolveAmount } from "./bulk-payment-form";

function kit(booking_value: ExhibitorKit["booking_value"]): ExhibitorKit {
	return { id: 1, booking_value } as ExhibitorKit;
}

test("booking_value mode fills each kit's own value", () => {
	expect(resolveAmount(kit("3500.0"), "booking_value", "")).toBe("3500.0");
	expect(resolveAmount(kit(1200), "booking_value", "")).toBe("1200");
});

test("booking_value mode leaves kits without a price untouched", () => {
	// undefined would overwrite a real amount_paid with nothing, so these must
	// be skipped rather than sent as 0.
	expect(resolveAmount(kit(null), "booking_value", "")).toBeUndefined();
	expect(resolveAmount(kit(undefined), "booking_value", "")).toBeUndefined();
	expect(resolveAmount(kit(""), "booking_value", "")).toBeUndefined();
});

test("a booking_value of 0 is still sent, not skipped", () => {
	expect(resolveAmount(kit("0.0"), "booking_value", "")).toBe("0.0");
});

test("fixed mode applies the same amount to every kit", () => {
	expect(resolveAmount(kit("3500.0"), "fixed", "99")).toBe("99");
	expect(resolveAmount(kit(null), "fixed", "99")).toBe("99");
});

test("unchanged mode never sends an amount", () => {
	expect(resolveAmount(kit("3500.0"), "unchanged", "99")).toBeUndefined();
});

test("mapWithConcurrency runs every item and keeps input order", async () => {
	const items = [1, 2, 3, 4, 5, 6, 7];
	const results = await mapWithConcurrency(items, 3, async (n) => n * 10);

	expect(
		results.map((r) => (r.status === "fulfilled" ? r.value : null)),
	).toEqual([10, 20, 30, 40, 50, 60, 70]);
});

test("mapWithConcurrency never exceeds the limit", async () => {
	let inFlight = 0;
	let peak = 0;

	await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3, async () => {
		inFlight++;
		peak = Math.max(peak, inFlight);
		await new Promise((r) => setTimeout(r, 5));
		inFlight--;
	});

	expect(peak).toBeLessThanOrEqual(3);
});

test("one failure does not abort the rest of the batch", async () => {
	const results = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
		if (n === 2) throw new Error("nope");
		return n;
	});

	expect(results.map((r) => r.status)).toEqual([
		"fulfilled",
		"rejected",
		"fulfilled",
	]);
	expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
});
