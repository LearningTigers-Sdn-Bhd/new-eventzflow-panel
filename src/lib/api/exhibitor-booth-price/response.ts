export type BackendExhibitorBoothPrice = {
	id: number;
	event_id: number;
	booth_type: string;
	exhibitor_zone_id: number | null;
	zone: string | null;
	label: string;
	price: number | string;
	quota: number | null;
	created_at: string;
	updated_at: string;
};

export type ExhibitorBoothPrice = {
	id: number;
	eventId: number;
	boothType: "shell_scheme" | "raw_space";
	exhibitorZoneId: number | null;
	zone: string | null;
	label: string;
	price: number;
	quota: number | null;
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
