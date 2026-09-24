import { describe, expect, test } from "bun:test";
import { parseValueList } from "./parse-value-list";

describe("parseValueList", () => {
	test("reads tab-separated table rows with Bil. column and quota", () => {
		expect(
			parseValueList("1.\tKEMENTERIAN KEWANGAN\t20\n2.\tJABATAN AIR\t10"),
		).toEqual([
			{ value: "KEMENTERIAN KEWANGAN", quota: 20 },
			{ value: "JABATAN AIR", quota: 10 },
		]);
	});

	test("reads plain lines, numbered or not, quota optional", () => {
		expect(
			parseValueList("1. PEJABAT DAERAH PAPAR 5\n\nSABAH NET SDN BHD\n"),
		).toEqual([
			{ value: "PEJABAT DAERAH PAPAR", quota: 5 },
			{ value: "SABAH NET SDN BHD" },
		]);
	});

	test("keeps numbers that are part of the name and drops duplicates", () => {
		expect(parseValueList("UNIT 2020\tabc\nJABATAN A\nJABATAN A 3")).toEqual([
			{ value: "UNIT 2020 abc" },
			{ value: "JABATAN A" },
		]);
	});
});
