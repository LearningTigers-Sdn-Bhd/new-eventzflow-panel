// Groups the raw delivery statuses the same way the Email Status page does.
export type DeliveryGroups = {
	delivered: number;
	sent: number;
	pending: number;
	problem: number;
};

export function groupDeliveryCounts(
	counts: Record<string, number>,
): DeliveryGroups {
	const n = (...keys: string[]) =>
		keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0);
	return {
		delivered: n("delivered"),
		sent: n("sent"),
		pending: n("queued", "sending"),
		problem: n("failed", "bounced", "complained", "suppressed"),
	};
}
