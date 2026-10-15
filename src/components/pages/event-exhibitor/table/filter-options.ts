export type ExhibitorFilterRow = {
	boothPricingLabel?: string | null;
	zone?: string | null;
};

export type ExhibitorFilterOptions = {
	pricingLabels: string[];
	zones: string[];
	hasUnassignedZone: boolean;
};

export function getExhibitorFilterOptions(
	rows: ExhibitorFilterRow[],
	configuredPricingLabels: string[] = [],
	configuredZones: string[] = [],
): ExhibitorFilterOptions {
	const pricingLabels = Array.from(
		new Set([
			...configuredPricingLabels.filter(Boolean),
			...rows
				.map((row) => row.boothPricingLabel)
				.filter((label): label is string => Boolean(label)),
		]),
	).sort((left, right) => left.localeCompare(right));
	const zones = Array.from(
		new Set([
			...configuredZones.filter(Boolean),
			...rows
				.map((row) => row.zone)
				.filter((zone): zone is string => Boolean(zone)),
		]),
	).sort((left, right) => left.localeCompare(right));

	return {
		pricingLabels,
		zones,
		hasUnassignedZone: rows.some((row) => !row.zone),
	};
}
