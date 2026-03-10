export type GuestPolicyMode = "unlimited" | "none" | "limited";

export interface GuestPolicyValue {
	mode: GuestPolicyMode;
	limit: number;
}

const DEFAULT_LIMIT = 1;

export function guestPolicyValueFromLimit(
	extraGuestLimit: number | null | undefined,
): GuestPolicyValue {
	if (extraGuestLimit == null) {
		return { mode: "unlimited", limit: DEFAULT_LIMIT };
	}

	if (extraGuestLimit === 0) {
		return { mode: "none", limit: DEFAULT_LIMIT };
	}

	return { mode: "limited", limit: extraGuestLimit };
}

export function guestPolicyLimitToValue(
	mode: GuestPolicyMode,
	limit: number,
): number | null {
	if (mode === "unlimited") {
		return null;
	}

	if (mode === "none") {
		return 0;
	}

	return Math.max(1, Math.floor(limit));
}
