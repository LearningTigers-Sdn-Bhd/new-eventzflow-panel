/** Local data is untrusted and has no edit timestamps. Keep the original keys as backup. */
export function parseLegacyCollection(
	claimedRaw: string | null,
	giftsRaw: string | null,
) {
	const claimed: unknown = JSON.parse(claimedRaw ?? "[]");
	const gifts: unknown = JSON.parse(giftsRaw ?? "{}");
	if (
		!Array.isArray(claimed) ||
		claimed.some((id) => typeof id !== "string") ||
		!gifts ||
		typeof gifts !== "object" ||
		Array.isArray(gifts) ||
		Object.values(gifts).some(
			(gift) => typeof gift !== "string" || gift.length > 500,
		)
	) {
		throw new Error(
			"Browser collection records are invalid; the original data has been kept.",
		);
	}
	return {
		claimed: new Set<string>(claimed),
		gifts: gifts as Record<string, string>,
		ids: [...new Set([...claimed, ...Object.keys(gifts)])],
	};
}
