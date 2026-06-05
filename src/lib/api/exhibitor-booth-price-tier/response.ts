export type BackendExhibitorBoothPriceTier = {
	id: number;
	exhibitor_booth_price_id: number;
	price: number | string;
	start_date: string;
	end_date?: string | null;
	label: string;
	active?: boolean;
	created_at: string;
	updated_at: string;
};

export type ExhibitorBoothPriceTier = {
	id: number;
	exhibitorBoothPriceId: number;
	price: number;
	startDate: string;
	endDate?: string;
	label: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorBoothPriceTierResponse = {
	success: boolean;
	priceTier: ExhibitorBoothPriceTier;
};

export type UpdateExhibitorBoothPriceTierResponse = {
	success: boolean;
	priceTier: ExhibitorBoothPriceTier;
};

export type DeleteExhibitorBoothPriceTierResponse = {
	success: boolean;
};
