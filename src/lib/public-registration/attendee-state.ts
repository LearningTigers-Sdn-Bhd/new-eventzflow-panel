export interface AttendeeStateRow {
	custom_fields_data: Record<string, string>;
}

interface NormalizeAttendeeModeOptions<T extends AttendeeStateRow> {
	registrationMode: "single" | "group";
	minAttendees: number;
	createAttendee: () => T;
}

export function normalizeAttendeesForMode<T extends AttendeeStateRow>(
	attendees: T[],
	options: NormalizeAttendeeModeOptions<T>,
): T[] {
	if (options.registrationMode === "single") {
		return attendees.length > 1 ? attendees.slice(0, 1) : attendees;
	}

	if (attendees.length >= options.minAttendees) {
		return attendees;
	}

	const next = [...attendees];
	while (next.length < options.minAttendees) {
		next.push(options.createAttendee());
	}

	return next;
}

export function syncAttendeeCustomFieldKeys<T extends AttendeeStateRow>(
	attendees: T[],
	customLabelKeys: string[],
): T[] {
	const keySet = new Set(customLabelKeys);
	let hasChanged = false;

	const next = attendees.map((attendee) => {
		const currentFields = attendee.custom_fields_data ?? {};
		const currentKeys = Object.keys(currentFields);

		const hasMissingKey = customLabelKeys.some(
			(key) => !(key in currentFields),
		);
		const hasExtraKey = currentKeys.some((key) => !keySet.has(key));

		if (!hasMissingKey && !hasExtraKey) {
			return attendee;
		}

		hasChanged = true;
		const normalizedFields = customLabelKeys.reduce<Record<string, string>>(
			(acc, key) => {
				acc[key] = currentFields[key] ?? "";
				return acc;
			},
			{},
		);

		return {
			...attendee,
			custom_fields_data: normalizedFields,
		};
	});

	return hasChanged ? next : attendees;
}
