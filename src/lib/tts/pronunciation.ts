const PRONUNCIATION_RULES: ReadonlyArray<{
	pattern: RegExp;
	replacement: string;
}> = [
	{ pattern: /\s*@\s*/g, replacement: " alias " },
	{
		pattern: /\b(?:[Yy]\.?\s*[Aa]\.?\s*[Bb]|YAB|YAb|Yab|yab)\.?(?=\s|$)/g,
		replacement: "Yang Amat Berhormat",
	},
	{
		pattern:
			/\b(?:[Yy]\.?\s*[Bb]\.?\s*[Hh]\.?\s*[Gg]|YBhg|YBHG|Ybhg|ybhg)\.?(?=\s|$)/g,
		replacement: "Yang Berbahagia",
	},
	{
		pattern: /\b(?:[Yy]\.?\s*[Bb]|YB|Yb|yb)\.?(?=\s|$)/g,
		replacement: "Yang Berhormat",
	},
	{
		pattern: /\b(?:YBrs|YBRS|Ybrs|ybrs)\.?(?=\s|$)/g,
		replacement: "Yang Berusaha",
	},
	{
		pattern:
			/\b(?:Assoc\.?\s*Prof\.?|ASSOC\.?\s*PROF\.?|Assoc\.?\s*prof\.?|assoc\.?\s*prof\.?)(?=\s|$)/g,
		replacement: "Associate Professor",
	},
	{ pattern: /\b(?:Ts|TS|ts)\.?(?=\s|$)/g, replacement: "Technologist" },
	{ pattern: /\b(?:Prof|PROF|prof)\.?(?=\s|$)/g, replacement: "Professor" },
	{ pattern: /\b(?:Dr|DR|dr)\.?(?=[\s,;:!?)]|$)/g, replacement: "Doctor" },
	{ pattern: /\b(?:Ir|IR|ir)\.?(?=\s|$)/g, replacement: "Engineer" },
	{ pattern: /\b(?:Ar|AR|ar)\.?(?=\s|$)/g, replacement: "Architect" },
	{ pattern: /\b(?:Tn|TN|tn)\.?(?=\s|$)/g, replacement: "Tuan" },
	{ pattern: /\b(?:En|EN|en)\.?(?=\s|$)/g, replacement: "Encik" },
	{ pattern: /\b(?:Pn|PN|pn)\.?(?=\s|$)/g, replacement: "Puan" },
	{ pattern: /\b(?:Mdm|MDM|mdm)\.?(?=\s|$)/g, replacement: "Madam" },
	{ pattern: /\b(?:Ms|MS|ms)\.?(?=\s|$)/g, replacement: "Miss" },
	{ pattern: /\b(?:Mr|MR|mr)\.?(?=\s|$)/g, replacement: "Mister" },
	{ pattern: /\b(?:Hjh|HJH|hjh)\.?(?=\s|$)/g, replacement: "Hajah" },
	{ pattern: /\b(?:Hj|HJ|hj)\.?(?=\s|$)/g, replacement: "Haji" },
	{ pattern: /\bb\.(?=\s|$)/g, replacement: "bin" },
	{ pattern: /\bbt\.(?=\s|$)/g, replacement: "binti" },
	{ pattern: /\b(?:Bte|BTE|bte)\.?(?=\s|$)/g, replacement: "binti" },
	{ pattern: /\b(?:Muhd|MUHD|muhd)\.?(?=\s|$)/g, replacement: "Muhammad" },
	{ pattern: /\b(?:Md|MD|md)\.?(?=\s|$)/g, replacement: "Muhammad" },
	{ pattern: /\b(?:Vitales|VITALES|vitales)\b/g, replacement: "vee ta les" },
	{ pattern: /\b(?:Rebecca|REBECCA|rebecca)\b/g, replacement: "Rebeka" },
	{ pattern: /\b(?:Ramle|RAMLE|ramle)\b/g, replacement: "Ramlee" },
];

export function normalizeMalaysianPronunciation(text: string): string {
	const normalizedText = PRONUNCIATION_RULES.reduce((result, rule) => {
		return result.replace(rule.pattern, rule.replacement);
	}, text);

	return normalizeUppercaseNameWords(normalizedText);
}

function normalizeUppercaseNameWords(text: string): string {
	const uppercaseWords = text.match(/\b[A-Z]{3,}\b/g) ?? [];

	if (uppercaseWords.length < 2) {
		return text;
	}

	return text.replace(/\b[A-Z]{3,}\b/g, (word) => {
		if (/^[IVXLCDM]+$/.test(word)) {
			return word;
		}

		return word.charAt(0) + word.slice(1).toLowerCase();
	});
}

export function prepareTtsText(text: string, normalize = true): string {
	if (!normalize) {
		return text;
	}

	return normalizeMalaysianPronunciation(text);
}
