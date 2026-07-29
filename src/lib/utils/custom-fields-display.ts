export interface CustomFieldDisplayEntry {
	key: string;
	label: string;
	value: string;
}

const HIDDEN_CUSTOM_FIELD_KEYS = new Set([
	"is_booth_manager",
	"payment_option",
]);

function isEffectivelyEmptyCustomFieldValue(value: unknown): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (Array.isArray(value)) {
		return value.length === 0;
	}

	if (typeof value === "string") {
		const trimmedValue = value.trim();

		if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
			try {
				const parsedValue = JSON.parse(trimmedValue);
				if (Array.isArray(parsedValue) && parsedValue.length === 0) {
					return true;
				}
			} catch {
				// Ignore invalid JSON-like strings and treat them as normal strings below.
			}
		}

		return trimmedValue === "" || trimmedValue === "-";
	}

	return false;
}

function formatPrimitiveArray(
	value: Array<string | number | boolean>,
	asBullets: boolean,
): string {
	if (asBullets) {
		return value.map((item) => `- ${String(item)}`).join("\n");
	}

	return value.map((item) => String(item)).join(", ");
}

export function humanizeCustomFieldKey(key: string): string {
	return key
		.replace(/[_-]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function formatCustomFieldValue(
	value: unknown,
	options?: { asBullets?: boolean },
): string {
	if (value === null || value === undefined || value === "") {
		return "-";
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "-";
		}

		const isFlatPrimitiveArray = value.every(
			(item) =>
				typeof item === "string" ||
				typeof item === "number" ||
				typeof item === "boolean",
		);

		if (isFlatPrimitiveArray) {
			return formatPrimitiveArray(
				value as Array<string | number | boolean>,
				Boolean(options?.asBullets),
			);
		}

		return JSON.stringify(value);
	}

	if (typeof value === "string") {
		const trimmedValue = value.trim();
		if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
			try {
				const parsedValue = JSON.parse(trimmedValue);
				if (Array.isArray(parsedValue)) {
					return formatCustomFieldValue(parsedValue, options);
				}
			} catch {
				// Keep original string when it's not valid JSON
			}
		}

		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return JSON.stringify(value);
}

function formatIndemnityDate(value: unknown): string | null {
	if (typeof value !== "string" || value.trim() === "") {
		return null;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-MY", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function formatTicketCustomFieldValue(
	key: string,
	value: unknown,
): string {
	const normalizedKey = key.replace(/^_+/, "").toLowerCase();

	if (
		normalizedKey === "indemnity" &&
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value)
	) {
		const indemnity = value as Record<string, unknown>;
		const lines: string[] = [];

		if (indemnity.accepted === true) {
			lines.push("Accepted");
		} else if (indemnity.accepted === false) {
			lines.push("Not accepted");
		}

		if (
			typeof indemnity.signed_name === "string" &&
			indemnity.signed_name.trim()
		) {
			lines.push(`Signed by: ${indemnity.signed_name}`);
		}

		if (typeof indemnity.method === "string" && indemnity.method.trim()) {
			lines.push(`Method: ${humanizeCustomFieldKey(indemnity.method)}`);
		}

		const signedAt = formatIndemnityDate(indemnity.signed_at);
		if (signedAt) {
			lines.push(`Signed at: ${signedAt}`);
		}

		if (lines.length > 0) {
			return lines.join("\n");
		}
	}

	return formatCustomFieldValue(value);
}

export function formatCustomFieldEntries(
	data?: Record<string, unknown> | null,
): CustomFieldDisplayEntry[] {
	if (!data) {
		return [];
	}

	return Object.entries(data)
		.filter(([key, value]) => {
			if (key.startsWith("_") || HIDDEN_CUSTOM_FIELD_KEYS.has(key)) {
				return false;
			}

			return !isEffectivelyEmptyCustomFieldValue(value);
		})
		.map(([key, value]) => ({
			key,
			label: humanizeCustomFieldKey(key),
			value: formatCustomFieldValue(value, {
				asBullets: key === "other_services",
			}),
		}));
}
