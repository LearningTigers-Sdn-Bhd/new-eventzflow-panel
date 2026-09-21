/**
 * Shared status badge styling for consistent UI across the application.
 */

export type EventStatus = "published" | "draft" | "cancelled" | "completed";

export const eventStatusVariants: Record<EventStatus, string> = {
	published: "bg-green-500 text-white",
	draft: "bg-yellow-500 text-white",
	cancelled: "bg-red-500 text-white",
	completed: "bg-blue-500 text-white",
};

/**
 * Get the CSS class for an event status badge.
 * Returns classes with text-white included.
 */
export function getEventStatusClass(status: string): string {
	return eventStatusVariants[status as EventStatus] ?? "";
}

/**
 * Get the CSS class for an event status badge without text-white.
 * Use this when you want to control text color separately.
 */
export function getEventStatusBgClass(status: string): string {
	const bgOnly: Record<EventStatus, string> = {
		published: "bg-green-500",
		draft: "bg-yellow-500",
		cancelled: "bg-red-500",
		completed: "bg-blue-500",
	};
	return bgOnly[status as EventStatus] ?? "";
}

export type TicketTypeStatus = "published" | "draft" | "archived";

export const ticketTypeStatusVariants: Record<TicketTypeStatus, string> = {
	published: "bg-green-500",
	draft: "bg-yellow-500",
	archived: "bg-gray-500",
};

export function getTicketTypeStatusClass(status: string): string {
	return ticketTypeStatusVariants[status as TicketTypeStatus] ?? "";
}

export type EventTypeVariant = "ticket" | "visitor";

export const eventTypeVariants: Record<EventTypeVariant, string> = {
	ticket: "bg-purple-500 text-white",
	visitor: "bg-cyan-500 text-white",
};

export function getEventTypeClass(useTicket: boolean): string {
	return useTicket ? eventTypeVariants.ticket : eventTypeVariants.visitor;
}

export function getEventTypeLabel(useTicket: boolean): string {
	return useTicket ? "Ticket Event" : "Visitor Event";
}

/**
 * Shared activity-log category badge colors — used by both the per-event
 * Activity Log and the superadmin System Activity trail so the same
 * category always reads the same color across the app.
 */
export const activityCategoryVariants: Record<string, string> = {
	business_matching:
		"border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
	ticketing:
		"border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
	vouchers:
		"border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	lucky_draw:
		"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	seating:
		"border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
	events: "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
	exhibitor:
		"border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
	auth: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
	visitors:
		"border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
	event_setup: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	payments:
		"border-lime-500/40 bg-lime-500/10 text-lime-700 dark:text-lime-300",
	sponsorships:
		"border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
	wish_wall:
		"border-pink-500/40 bg-pink-500/10 text-pink-700 dark:text-pink-300",
	certificates:
		"border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
};

export function getActivityCategoryClass(category: string): string {
	return (
		activityCategoryVariants[category] ??
		"border-muted-foreground/30 bg-muted/20 text-muted-foreground"
	);
}

export const aiSeverityVariants: Record<string, string> = {
	low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	medium:
		"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	high: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function getAiSeverityClass(severity: string): string {
	return (
		aiSeverityVariants[severity] ??
		"border-muted-foreground/30 bg-muted/20 text-muted-foreground"
	);
}
