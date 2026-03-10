import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RSVP_DIR = new URL("./", import.meta.url);
const HEX_COLOR_PATTERN = /#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})/g;

function getTsxFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			return getTsxFiles(fullPath);
		}

		return entry.isFile() && fullPath.endsWith(".tsx") ? [fullPath] : [];
	});
}

describe("RSVP styling", () => {
	test("does not use hardcoded hex colors in RSVP TSX files", () => {
		const filesWithHexColors = getTsxFiles(RSVP_DIR.pathname)
			.map((filePath) => {
				const content = readFileSync(filePath, "utf8");
				const matches = content.match(HEX_COLOR_PATTERN) ?? [];

				return matches.length > 0 ? { filePath, matches } : null;
			})
			.filter((result) => result !== null);

		expect(filesWithHexColors).toEqual([]);
	});
});
