// Backend ticket type response
export interface BackendTicketType {
	id: number;
	event_id: number | null;
	name: string;
	price: string; // Decimal comes as string from Rails
	quantity: number;
	max_per_order: number;
	sale_starts_at: string | null;
	sale_ends_at: string | null;
	status: "draft" | "published" | "archived";
	hidden: boolean;
	custom_fields_data: Record<string, unknown>;
	created_at: string;
	updated_at: string;
	// Multi-day ticketing fields
	valid_from_date: string | null;
	valid_to_date: string | null;
	validity_description: string;
}

// Frontend ticket type format
export interface TicketType {
	id: number;
	eventId: number | null;
	name: string;
	price: number;
	quantity: number;
	maxPerOrder: number;
	saleStartsAt: string | null;
	saleEndsAt: string | null;
	status: "draft" | "published" | "archived";
	hidden: boolean;
	customFieldsData: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	// Multi-day ticketing fields
	validFromDate: string | null;
	validToDate: string | null;
	validityDescription: string;
}

// Response types for operations
export type CreateTicketTypeResponse = TicketType;
export type UpdateTicketTypeResponse = TicketType;
export type DeleteTicketTypeResponse = {
	success: boolean;
};
