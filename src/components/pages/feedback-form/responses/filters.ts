import { isValid, parse } from "date-fns";
import type { FeedbackFilters } from "@/lib/api/feedback-form";

export const ISO_DATE = "yyyy-MM-dd";

/** "2026-03-28" → a local Date (no timezone shift), or undefined when empty or invalid. */
export function parseIsoDate(value: string | undefined) {
	if (!value) return undefined;
	const date = parse(value, ISO_DATE, new Date());
	return isValid(date) ? date : undefined;
}

export const DEFAULT_FILTERS: FeedbackFilters = {
	ticketTypeId: "all",
	from: "",
	to: "",
};

export function hasActiveFilters(filters: FeedbackFilters) {
	return (
		(!!filters.ticketTypeId && filters.ticketTypeId !== "all") ||
		!!filters.from ||
		!!filters.to
	);
}

/** Stable react-query key part for a filter set. */
export function filtersKey(filters: FeedbackFilters) {
	return [filters.ticketTypeId ?? "all", filters.from ?? "", filters.to ?? ""];
}

/** "4.3" → 4.3 style helpers shared by the views. */
export function formatPercent(value: number | null | undefined) {
	return value === null || value === undefined ? "—" : `${value}%`;
}

export function formatScore(value: number | null | undefined) {
	return value === null || value === undefined ? "—" : value.toFixed(1);
}
