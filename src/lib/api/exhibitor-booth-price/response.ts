export type BackendExhibitorBoothPrice = {
	id: number;
	event_id: number;
	booth_type: string;
	exhibitor_zone_id: number | null;
	zone: string | null;
	label: string;
	price: number | string;
	current_price?: number | string;
	active_price_tier_label?: string | null;
	quota: number | null;
	conferences_included: boolean;
	created_at: string;
	updated_at: string;
};

export type ExhibitorBoothPrice = {
	id: number;
	eventId: number;
	boothType: string;
	exhibitorZoneId: number | null;
	zone: string | null;
	label: string;
	price: number;
	currentPrice: number;
	activePriceTierLabel: string | null;
	quota: number | null;
	conferencesIncluded: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorBoothPriceResponse = {
	success: boolean;
	boothPrice: ExhibitorBoothPrice;
};

export type UpdateExhibitorBoothPriceResponse = {
	success: boolean;
	boothPrice: ExhibitorBoothPrice;
};

export type DeleteExhibitorBoothPriceResponse = {
	success: boolean;
};
