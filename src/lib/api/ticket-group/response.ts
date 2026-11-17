export interface TicketGroup {
	id: number;
	name: string;
	position: number;
	/** Ticket type ids this group fills first, mixed evenly. */
	priority_ticket_type_ids: number[];
	ticket_count: number;
	/** ticket_type_id -> paid tickets of that type in the group. */
	type_counts: Record<string, number>;
}

export interface TicketGroupsPayload {
	groups: TicketGroup[];
	unassigned_count: number;
	unassigned_by_type: Record<string, number>;
}

export interface TicketGroupPreview {
	moves: number;
	groups: Array<{
		id: number;
		name: string;
		/** Total after this run. */
		count: number;
		/** Total right now. */
		current_count: number;
		/** Tickets arriving in this group in this run. */
		added: number;
		/** ticket_type_id -> tickets arriving */
		added_by_type: Record<string, number>;
		/** ticket_type_id -> number of tickets */
		by_type: Record<string, number>;
	}>;
}

export type TicketGroupMode = "new" | "all";
