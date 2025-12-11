// Backend API response type (matches backend snake_case)
export type BackendEventPrintingServicePriceTier = {
	id: number;
	event_printing_service_id: number;
	price: number;
	start_date: string;
	end_date?: string;
	label: string;
	created_at: string;
	updated_at: string;
};

// Frontend type
export type EventPrintingServicePriceTier = {
	id: number;
	eventPrintingServiceId: number;
	price: number;
	startDate: string;
	endDate?: string;
	label: string;
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreatePrintingServicePriceTierResponse = {
	success: boolean;
	priceTier: EventPrintingServicePriceTier;
};

export type UpdatePrintingServicePriceTierResponse = {
	success: boolean;
	priceTier: EventPrintingServicePriceTier;
};

export type DeletePrintingServicePriceTierResponse = {
	success: boolean;
	priceTier: EventPrintingServicePriceTier;
};
