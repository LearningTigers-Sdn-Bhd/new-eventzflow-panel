export type BackendExhibitorZone = {
	id: number;
	event_id: number;
	zone: string;
	quota: number | null;
	created_at: string;
	updated_at: string;
};

export type ExhibitorZone = {
	id: number;
	eventId: number;
	zone: string;
	quota: number | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorZoneResponse = {
	success: boolean;
	zone: ExhibitorZone;
};

export type UpdateExhibitorZoneResponse = {
	success: boolean;
	zone: ExhibitorZone;
};

export type DeleteExhibitorZoneResponse = {
	success: boolean;
};
