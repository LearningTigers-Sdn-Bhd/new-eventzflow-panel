import { describe, expect, test } from "bun:test";
import {
	createManualBoothRow,
	hasDuplicateBoothNumbers,
	normalizeBoothNumber,
	toBatchBooths,
} from "./manual-add-form-utils";

describe("createManualBoothRow", () => {
	test("returns an empty row with the given id", () => {
		const row = createManualBoothRow("booth-1");
		expect(row).toEqual({
			id: "booth-1",
			boothPriceId: "",
			boothType: "",
			packageId: "",
			boothNumber: "",
			voucherCode: "",
		});
	});
});

describe("normalizeBoothNumber", () => {
	test("trims and uppercases", () => {
		expect(normalizeBoothNumber(" a-01 ")).toBe("A-01");
	});
});

describe("hasDuplicateBoothNumbers", () => {
	test("detects duplicates that differ only by case/whitespace", () => {
		const rows = [
			{ ...createManualBoothRow("1"), boothNumber: "a-01" },
			{ ...createManualBoothRow("2"), boothNumber: " A-01 " },
		];
		expect(hasDuplicateBoothNumbers(rows)).toBe(true);
	});

	test("ignores blank booth numbers", () => {
		const rows = [
			{ ...createManualBoothRow("1"), boothNumber: "" },
			{ ...createManualBoothRow("2"), boothNumber: "" },
		];
		expect(hasDuplicateBoothNumbers(rows)).toBe(false);
	});

	test("returns false for distinct booth numbers", () => {
		const rows = [
			{ ...createManualBoothRow("1"), boothNumber: "A-01" },
			{ ...createManualBoothRow("2"), boothNumber: "A-02" },
		];
		expect(hasDuplicateBoothNumbers(rows)).toBe(false);
	});
});

describe("toBatchBooths", () => {
	test("maps numeric IDs and trims optional values when prices exist", () => {
		const rows = [
			{
				id: "1",
				boothPriceId: "5",
				boothType: "",
				packageId: "9",
				boothNumber: " A-01 ",
				voucherCode: " CODE1 ",
			},
		];
		expect(toBatchBooths(rows, true)).toEqual([
			{
				exhibitor_booth_price_id: 5,
				exhibitor_package_id: 9,
				booth_number: "A-01",
				voucher_code: "CODE1",
			},
		]);
	});

	test("falls back to booth_type when the event has no booth prices", () => {
		const rows = [
			{
				id: "1",
				boothPriceId: "",
				boothType: "Shell Scheme",
				packageId: "",
				boothNumber: "",
				voucherCode: "",
			},
		];
		expect(toBatchBooths(rows, false)).toEqual([
			{ booth_type: "Shell Scheme" },
		]);
	});

	test("omits empty optional fields", () => {
		const rows = [createManualBoothRow("1")];
		expect(toBatchBooths(rows, true)).toEqual([{}]);
	});
});
