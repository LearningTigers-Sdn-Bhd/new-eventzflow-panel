export type BackendExhibitorPackage = {
	id: number;
	event_id: number;
	exhibitor_booth_price_id: number;
	name: string;
	inclusions: string | null;
	price: number | string;
	quota: number | null;
	booth_price_label?: string | null;
	booth_price_zone?: string | null;
	booth_price_booth_type?: string | null;
	created_at: string;
	updated_at: string;
};

export type ExhibitorPackage = {
	id: number;
	eventId: number;
	exhibitorBoothPriceId: number;
	name: string;
	inclusions: string | null;
	price: number;
	quota: number | null;
	boothPriceLabel: string | null;
	boothPriceZone: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorPackageResponse = {
	success: boolean;
	exhibitorPackage: ExhibitorPackage;
};

export type UpdateExhibitorPackageResponse = {
	success: boolean;
	exhibitorPackage: ExhibitorPackage;
};

export type DeleteExhibitorPackageResponse = {
	success: boolean;
};
