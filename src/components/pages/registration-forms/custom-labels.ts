export interface CustomLabelInput {
	id: string;
	value: string;
}

export function buildCustomLabelsData(
	labels: CustomLabelInput[],
): Record<string, string> {
	const result: Record<string, string> = {};
	const keyCounts: Record<string, number> = {};

	for (const label of labels) {
		const value = label.value.trim();
		if (!value) continue;

		const baseKey =
			value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "_")
				.replace(/^_+|_+$/g, "") || "field";

		const seenCount = keyCounts[baseKey] ?? 0;
		keyCounts[baseKey] = seenCount + 1;

		const key = seenCount === 0 ? baseKey : `${baseKey}_${seenCount + 1}`;
		result[key] = value;
	}

	return result;
}

export function getInitialCustomLabels(
	customLabelsData?: Record<string, string> | null,
): CustomLabelInput[] {
	if (!customLabelsData || Object.keys(customLabelsData).length === 0) {
		return [];
	}

	return Object.values(customLabelsData).map((value) => ({
		id: crypto.randomUUID(),
		value,
	}));
}
