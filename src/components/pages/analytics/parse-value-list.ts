export interface ParsedListItem {
	value: string;
	quota?: number;
}

/**
 * Parses a pasted master list, one value per line, in order. A trailing
 * number is the quota — works for Word/Excel table pastes (tab-separated,
 * with an optional leading "Bil." number column) and plain "NAME 20" lines.
 * Duplicate values keep their first occurrence.
 */
export function parseValueList(text: string): ParsedListItem[] {
	const seen = new Set<string>();
	const items: ParsedListItem[] = [];

	for (const line of text.split(/\r?\n/)) {
		const cells = line
			.split("\t")
			.map((cell) => cell.trim())
			.filter(Boolean);
		if (cells.length > 1 && /^\d+\.?$/.test(cells[0])) cells.shift();

		let quota: number | undefined;
		if (cells.length > 1 && /^\d+$/.test(cells[cells.length - 1])) {
			quota = Number(cells.pop());
		}

		let value = cells.join(" ").replace(/^\d+\.\s+/, "");
		const trailing = quota === undefined && value.match(/^(.*\S)\s+(\d+)$/);
		if (trailing) {
			value = trailing[1];
			quota = Number(trailing[2]);
		}

		value = value.replace(/\s+/g, " ").trim();
		if (!value || seen.has(value)) continue;
		seen.add(value);
		items.push(quota === undefined ? { value } : { value, quota });
	}

	return items;
}
