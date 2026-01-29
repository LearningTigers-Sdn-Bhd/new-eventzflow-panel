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
