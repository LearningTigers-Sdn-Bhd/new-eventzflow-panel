export interface CustomLabelEntry {
	key: string;
	label: string;
}

export interface CustomLabelInput {
	id: string;
	value: string;
}

export function buildCustomLabelsData(
	labels: CustomLabelInput[],
): CustomLabelEntry[] {
	const result: CustomLabelEntry[] = [];
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
		result.push({ key, label: value });
	}

	return result;
}

export function getInitialCustomLabels(
	customLabelsData?: CustomLabelEntry[] | null,
): CustomLabelInput[] {
	if (!customLabelsData || customLabelsData.length === 0) {
		return [];
	}

	return customLabelsData.map((entry) => ({
		id: crypto.randomUUID(),
		value: entry.label,
	}));
}
