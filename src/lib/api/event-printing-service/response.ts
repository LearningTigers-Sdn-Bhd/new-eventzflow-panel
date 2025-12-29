import type { BackendPrintingService, PrintingService } from "../printing-service";

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

export type BackendEventPrintingService = {
	id: number;
	event_id: number;
	printing_service_id: number;
	printing_service?: BackendPrintingService;
	event_printing_service_price_tiers?: BackendEventPrintingServicePriceTier[];
	created_at: string;
	updated_at: string;
};

// Frontend types
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

export type EventPrintingService = {
	id: number;
	eventId: number;
	printingServiceId: number;
	printingService?: PrintingService;
	eventPrintingServicePriceTiers?: EventPrintingServicePriceTier[];
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type DeleteEventPrintingServiceResponse = {
	success: boolean;
	item: EventPrintingService;
};
