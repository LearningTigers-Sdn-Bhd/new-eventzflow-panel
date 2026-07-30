import type { ExhibitorBoothStatus } from "./request";

export type BackendExhibitorBooth = {
	id: number;
	number: string;
	status: ExhibitorBoothStatus;
	exhibitor_booth_price_id: number;
	booth_type: string;
	zone: string | null;
	label: string;
	held_by: string | null;
	held_since: string | null;
};

export type ExhibitorBooth = {
	id: number;
	number: string;
	status: ExhibitorBoothStatus;
	exhibitorBoothPriceId: number;
	boothType: string;
	zone: string | null;
	label: string;
	heldBy: string | null;
	heldSince: string | null;
};

export type CreateExhibitorBoothResponse = {
	success: boolean;
	booth: ExhibitorBooth;
};

export type BulkCreateExhibitorBoothsResponse = {
	success: boolean;
	booths: ExhibitorBooth[];
};

export type UpdateExhibitorBoothResponse = CreateExhibitorBoothResponse;
export type ReleaseExhibitorBoothResponse = CreateExhibitorBoothResponse;

export type DeleteExhibitorBoothResponse = {
	success: boolean;
};
