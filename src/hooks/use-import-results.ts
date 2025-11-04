import { useMemo, useState } from "react";
import type { ImportTicketsResponse } from "@/lib/api/imports";

export type FilterType = "all" | "created" | "updated" | "skipped" | "errors";

export type ImportResultItem = {
	category: "created" | "updated" | "skipped" | "errors";
	data: Record<string, unknown> | string;
};

/**
 * Hook for managing import results state and filtering
 *
 * @example
 * ```tsx
 * const { liveResult, setLiveResult, filterType, setFilterType, filteredItems } = useImportResults();
 * ```
 */
export function useImportResults() {
	const [liveResult, setLiveResult] = useState<ImportTicketsResponse | null>(
		null,
	);
	const [filterType, setFilterType] = useState<FilterType>("all");

	// Flatten and prepare items for display
	const allItems = useMemo<ImportResultItem[]>(() => {
		if (!liveResult) return [];

		const items: ImportResultItem[] = [];

		// Add created items
		if (liveResult.created?.data) {
			liveResult.created.data.forEach((item) => {
				items.push({ category: "created", data: item });
			});
		}

		// Add updated items
		if (liveResult.updated?.data) {
			liveResult.updated.data.forEach((item) => {
				items.push({ category: "updated", data: item });
			});
		}

		// Add skipped items
		if (liveResult.skipped?.data) {
			liveResult.skipped.data.forEach((item) => {
				items.push({ category: "skipped", data: item });
			});
		}

		// Add error items
		if (liveResult.errors?.data) {
			liveResult.errors.data.forEach((error) => {
				items.push({ category: "errors", data: error });
			});
		}

		return items;
	}, [liveResult]);

	// Filter items based on selected filter
	const filteredItems = useMemo(() => {
		if (filterType === "all") return allItems;
		return allItems.filter((item) => item.category === filterType);
	}, [allItems, filterType]);

	return {
		liveResult,
		setLiveResult,
		filterType,
		setFilterType,
		filteredItems,
		allItems,
	};
}
