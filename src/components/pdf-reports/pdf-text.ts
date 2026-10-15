// Characters the built-in PDF fonts (Helvetica, WinAnsi) can draw beyond Latin-1.
const WIN_ANSI_EXTRAS = new Set(
	"€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ".split("").map((c) => c.codePointAt(0)),
);

function isDrawable(codePoint: number) {
	if (codePoint === 9 || codePoint === 10 || codePoint === 13) return true;
	if (codePoint >= 32 && codePoint <= 126) return true;
	if (codePoint >= 160 && codePoint <= 255) return true;
	return WIN_ANSI_EXTRAS.has(codePoint);
}

/**
 * The built-in PDF fonts have no CJK, Arabic or emoji glyphs, and unsupported
 * characters render as overlapping garbage. Replace each one with "?" so the
 * text stays readable; the Excel export carries the original.
 */
export function sanitizeForPdf(text: string) {
	let out = "";
	for (const char of text) {
		out += isDrawable(char.codePointAt(0) ?? 0) ? char : "?";
	}
	return out;
}

export function needsSanitizing(text: string) {
	return sanitizeForPdf(text) !== text;
}
