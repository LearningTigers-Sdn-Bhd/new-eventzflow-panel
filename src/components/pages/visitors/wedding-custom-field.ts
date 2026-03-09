import type { Event } from "@/lib/api/event";

export const WEDDING_SIDE_FIELD_KEY = "wedding_side";
export const WEDDING_SIDE_FIELD_LABEL = "Wedding Side";

export const WEDDING_SIDE_OPTIONS = [
	{ value: "Groom", label: "Groom" },
	{ value: "Bride", label: "Bride" },
	{ value: "Groom and Bride", label: "Groom and Bride" },
];

export function buildVisitorLabelsData(
	event?: Pick<Event, "labels_data" | "use_wedding">,
) {
	const labelsData = { ...(event?.labels_data ?? {}) };

	if (event?.use_wedding && !labelsData[WEDDING_SIDE_FIELD_KEY]) {
		labelsData[WEDDING_SIDE_FIELD_KEY] = WEDDING_SIDE_FIELD_LABEL;
	}

	return labelsData;
}
