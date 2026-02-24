// Backend API response type (matches backend snake_case)
export type BackendTicketTypePriceTier = {
	id: number;
	label: string;
	price: string; // Decimal comes as string from Rails
	starts_at: string;
	ends_at: string;
	active: boolean;
};

// Frontend type
export type TicketTypePriceTier = {
	id: number;
	label: string;
	price: number;
	startsAt: string;
	endsAt: string;
	active: boolean;
};

// Response types for operations
export type CreatePriceTierResponse = {
	success: boolean;
	priceTier: TicketTypePriceTier;
};

export type UpdatePriceTierResponse = {
	success: boolean;
	priceTier: TicketTypePriceTier;
};

export type DeletePriceTierResponse = {
	success: boolean;
};
