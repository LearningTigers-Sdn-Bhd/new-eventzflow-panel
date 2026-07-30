export function generateBoothRange({
	prefix,
	from,
	to,
	padding = 3,
}: {
	prefix: string;
	from: number;
	to: number;
	padding?: number;
}): string[] {
	if (
		!Number.isInteger(from) ||
		!Number.isInteger(to) ||
		from < 0 ||
		to < from
	) {
		return [];
	}

	const normalizedPrefix = prefix.trim().toUpperCase();
	return Array.from({ length: to - from + 1 }, (_, index) => {
		const value = String(from + index).padStart(padding, "0");
		return `${normalizedPrefix}${value}`;
	});
}

export function parsePastedBoothNumbers(value: string): string[] {
	return Array.from(
		new Set(
			value
				.split(/[,\n]/)
				.map((number) => number.trim().toUpperCase())
				.filter(Boolean),
		),
	);
}
