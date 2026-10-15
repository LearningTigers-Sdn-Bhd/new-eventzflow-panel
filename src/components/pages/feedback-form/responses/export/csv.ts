import { type Cell, type ExportOptions, responseTable } from "./rows";

/**
 * Stops spreadsheet apps from running answers as formulas. Free-text answers
 * are attacker-controlled, so anything starting with = + - @ (or a control
 * character) gets a leading apostrophe.
 */
export function neutralizeFormula(value: Cell): Cell {
	if (typeof value !== "string") return value;
	return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCsv(value: Cell) {
	const text = String(neutralizeFormula(value));
	return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][]) {
	return [headers, ...rows]
		.map((row) => row.map(escapeCsv).join(","))
		.join("\r\n");
}

// Excel needs the BOM to read UTF-8 (names, Japanese comments, emoji) correctly.
const BOM = "﻿";

export function buildResponsesCsv(
	data: Parameters<typeof responseTable>[0],
	options: ExportOptions,
) {
	const { headers, rows } = responseTable(data, options);
	return BOM + toCsv(headers, rows);
}
