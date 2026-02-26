export type BackendExhibitorBoothPrice = {
	id: number;
	event_id: number;
	booth_type: string;
	label: string;
	price: number | string;
	created_at: string;
	updated_at: string;
};

export type ExhibitorBoothPrice = {
	id: number;
	eventId: number;
	boothType: "shell_scheme" | "raw_space";
	label: string;
	price: number;
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
