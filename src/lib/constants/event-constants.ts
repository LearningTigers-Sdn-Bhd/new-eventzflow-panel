export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type EventFilter = "active" | "archived" | "all";

/**
 * Status filter options for event status dropdowns
 * Used in both desktop and mobile table controls
 */
export const EVENT_STATUS_OPTIONS = [
	{ label: "All Statuses", value: "all" },
	{ label: "Draft", value: "draft" },
	{ label: "Published", value: "published" },
	{ label: "Cancelled", value: "cancelled" },
	{ label: "Completed", value: "completed" },
] as const;

/**
 * Event filter options (active/archived/all)
 * Used in both desktop and mobile table controls
 */
export const EVENT_FILTER_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Archived", value: "archived" },
	{ label: "All", value: "all" },
] as const;

/**
 * Event filter options with "Events" suffix for mobile
 */
export const EVENT_FILTER_OPTIONS_MOBILE: {
	label: string;
	value: EventFilter;
}[] = [
	{ label: "Active Events", value: "active" },
	{ label: "Archived Events", value: "archived" },
	{ label: "All Events", value: "all" },
];

/**
 * Status badge color classes
 * Maps event status to Tailwind CSS classes
 */
export const STATUS_BADGE_COLORS: Record<EventStatus, string> = {
	published: "bg-green-500",
	draft: "bg-yellow-500",
	cancelled: "bg-red-500",
	completed: "bg-blue-500",
} as const;

/**
 * Get status badge color class for a given status
 */
export function getStatusBadgeColor(status: EventStatus | string): string {
	return STATUS_BADGE_COLORS[status as EventStatus] || "bg-gray-500";
}
